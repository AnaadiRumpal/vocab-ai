import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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
      enum: ["WORD", "PHRASE", "IDIOM", "PHRASAL_VERB", "TECHNICAL_TERM", "OTHER"],
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
      description: "0 to 8 synonyms or close alternatives.",
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
    input.sourceText ? `Source sentence/context: ${input.sourceText}` : null,
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

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.3,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini did not return a vocabulary entry.");
  }

  const parsed = vocabEntrySchema.parse(JSON.parse(text));
  return parsed;
}