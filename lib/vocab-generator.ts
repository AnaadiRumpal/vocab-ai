import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY2,
].filter(Boolean) as string[];

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  "gemini-2.0-flash",
];

const cooldowns = new Map<string, number>();

function isRetryableError(error: unknown) {
  const text =
    error instanceof Error ? error.message : JSON.stringify(error);

  return (
    text.includes("429") ||
    text.includes("RESOURCE_EXHAUSTED") ||
    text.includes("quota") ||
    text.includes("503") ||
    text.includes("overloaded")
  );
}

const suggestedWordSchema = z.object({
  term: z.string(),
  relatedTo: z.string(),
  reason: z.string(),
});

const relatedWordsSchema = z.object({
  words: z.array(suggestedWordSchema).length(10),
});

export type SuggestedWord = z.infer<
  typeof suggestedWordSchema
>;

async function generateWithFallback(
  payload: Omit<
    Parameters<GoogleGenAI["models"]["generateContent"]>[0],
    "model"
  >
) {
  let lastError: unknown;

  for (const model of GEMINI_MODELS) {
    // Randomize key order to distribute load
    const startIndex = Math.floor(Math.random() * GEMINI_KEYS.length);

    const rotatedKeys = [
      ...GEMINI_KEYS.slice(startIndex),
      ...GEMINI_KEYS.slice(0, startIndex),
    ];

    for (const key of rotatedKeys) {
      const cooldownKey = `${model}:${key}`;

      // Skip temporarily cooled-down key/model combos
      if (Date.now() < (cooldowns.get(cooldownKey) ?? 0)) {
        continue;
      }

      try {
        console.log(`Trying Gemini model=${model}`);

        const ai = new GoogleGenAI({
          apiKey: key,
        });

        const response = await ai.models.generateContent({
          model,
          ...payload,
        });

        return response;
      } catch (error) {
        lastError = error;

          console.error(
            `Gemini failed for model=${model}`,
            JSON.stringify(error, null, 2)
          );

        if (!isRetryableError(error)) {
          throw error;
        }

        // Cool down this specific model+key pair for 60s
        cooldowns.set(cooldownKey, Date.now() + 60_000);

        console.warn(`Cooling down ${cooldownKey} for 60s`);
      }
    }
  }

  throw lastError;
}

export const vocabEntrySchema = z.object({
  term: z.string(),
  normalized: z.string(),
  kind: z.enum([
    "WORD",
    "PHRASE",
    "IDIOM",
    "PHRASAL_VERB",
    "TECHNICAL_TERM",
    "OTHER",
  ]),
  partOfSpeech: z.string().nullable(),
  meaning: z.string(),
  plainEnglish: z.string(),
  examples: z.array(z.string()),
  synonyms: z.array(z.string()),
  mnemonic: z.string().nullable(),
  etymology: z.string().nullable(),
  difficulty: z.number().int().min(1).max(5),
});

export type VocabEntry = z.infer<typeof vocabEntrySchema>;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    term: {
      type: Type.STRING,
      description: "The display form of the captured word or phrase.",
    },
    normalized: {
      type: Type.STRING,
      description:
        "Lowercase, whitespace-collapsed form used for duplicate detection.",
    },
    kind: {
      type: Type.STRING,
      enum: [
        "WORD",
        "PHRASE",
        "IDIOM",
        "PHRASAL_VERB",
        "TECHNICAL_TERM",
        "OTHER",
      ],
    },
    partOfSpeech: {
      type: Type.STRING,
      nullable: true,
      description:
        "Part of speech if relevant, such as noun, verb, adjective, adverb, or null for idioms/phrases.",
    },
    meaning: {
      type: Type.STRING,
      description: "Short dictionary-like meaning.",
    },
    plainEnglish: {
      type: Type.STRING,
      description: "Very simple explanation in plain English.",
    },
    examples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 natural example sentences.",
    },
    synonyms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "0 to 8 useful synonyms or close alternatives.",
    },
    mnemonic: {
      type: Type.STRING,
      nullable: true,
      description: "A short memory trick, or null if none is useful.",
    },
    etymology: {
      type: Type.STRING,
      nullable: true,
      description: "Brief etymology, or null if uncertain.",
    },
    difficulty: {
      type: Type.INTEGER,
      description: "Difficulty from 1 common/easy to 5 advanced/rare.",
    },
  },
  required: [
    "term",
    "normalized",
    "kind",
    "partOfSpeech",
    "meaning",
    "plainEnglish",
    "examples",
    "synonyms",
    "mnemonic",
    "etymology",
    "difficulty",
  ],
};

const relatedWordsResponseSchema = {
  type: Type.OBJECT,
  properties: {
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: {
            type: Type.STRING,
          },
          relatedTo: {
            type: Type.STRING,
          },
          reason: {
            type: Type.STRING,
          },
        },
        required: [
          "term",
          "relatedTo",
          "reason",
        ],
      },
    },
  },
  required: ["words"],
};

export async function generateRelatedWords(
  recentWords: {
    term: string;
    meaning: string;
  }[]
): Promise<SuggestedWord[]> {
  const prompt = [
    "Recent vocabulary:",
    ...recentWords.map(
      (w) => `${w.term} — ${w.meaning}`
    ),
    "",
    "Suggest 5 useful new vocabulary items.",
    "",
    "Rules:",
    "- Do not repeat existing words.",
    "- Use exactly one existing word in relatedTo.",
    "- Prefer common educated English over obscure words.",
    "- Mix synonyms, antonyms, related concepts, collocations, and idioms.",
    "- Expand the learner's vocabulary network.",
    "- reason must describe the relationship only.",
    "- reason must be 5 words or fewer.",
  ].join("\n");

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: relatedWordsResponseSchema,
      temperature: 0.8,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini did not return related words."
    );
  }

  const json = JSON.parse(text);

  const parsed =
    relatedWordsSchema.parse(json);

  const existing = new Set(
    recentWords.map((w) =>
      w.term.toLowerCase()
    )
  );

  return parsed.words.filter(
    (word) =>
      !existing.has(
        word.term.trim().toLowerCase()
      )
  );
}

export async function generateVocabEntry(input: {
  term: string;
  normalized: string;
  sourceText?: string | null;
}): Promise<VocabEntry> {
  const prompt = [
    "Generate a concise vocabulary learning card.",
    "",
    `Term or phrase: ${input.term}`,
    `Normalized form: ${input.normalized}`,
    input.sourceText
      ? `Source sentence/context: ${input.sourceText}`
      : null,
    "",
    "Guidelines:",
    "- The input may be a word, phrase, idiom, phrasal verb, or technical term.",
    "- If context is provided, prefer the meaning that fits the context.",
    "- Keep meaning short and dictionary-like.",
    "- Keep plainEnglish simple and memorable.",
    "- Return 2 to 4 natural example sentences.",
    "- Return 0 to 8 useful synonyms or close alternatives.",
    "- Mnemonic should be vivid but concise.",
    "- Etymology may be null if uncertain.",
    "- Difficulty: 1 = common/easy, 5 = advanced/rare.",
    "- normalized should be lowercase and whitespace-collapsed.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini did not return a vocabulary entry.");
  }

  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  return vocabEntrySchema.parse(json);
}