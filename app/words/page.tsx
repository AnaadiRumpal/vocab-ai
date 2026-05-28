import Link from "next/link";
import { Prisma } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteWordButton } from "@/components/delete-word-button";
import { db } from "@/lib/db";
import { WordMetaBadges } from "@/components/word-meta-badges";
import { WordsFilterBar } from "@/components/words-filter-bar";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const PAGE_SIZE = 3;

const STATUSES = ["NEW", "LEARNING", "REVIEWING", "MASTERED", "ARCHIVED"] as const;
const KINDS = ["WORD", "PHRASE", "IDIOM", "PHRASAL_VERB", "TECHNICAL_TERM", "OTHER"] as const;

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
function getDifficultyBadge(difficulty: number | null) {
  if (difficulty === 1) {
    return {
      label: "Common",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (difficulty === 2) {
    return {
      label: "Familiar",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  if (difficulty === 3) {
    return {
      label: "Intermediate",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (difficulty === 4) {
    return {
      label: "Advanced",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    };
  }

  if (difficulty === 5) {
    return {
      label: "Rare",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  return {
    label: "Unrated",
    className: "border-muted bg-muted/40 text-muted-foreground",
  };
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {

    const session = await auth();

    if (!session?.user?.id) {
    redirect("/");
    }

    const userId = session.user.id;

  const params = await searchParams;

  const q = getParam(params, "q")?.trim() ?? "";
  const status = getParam(params, "status") ?? "ACTIVE";
  const kind = getParam(params, "kind") ?? "ALL";
  const due = getParam(params, "due") ?? "ALL";
  const pageParam = Number(getParam(params, "page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const where: Prisma.WordWhereInput = {
    userId,
  };

  if (status === "ACTIVE") {
    where.status = {
      not: "ARCHIVED",
    };
  } else if (STATUSES.includes(status as (typeof STATUSES)[number])) {
    where.status = status as (typeof STATUSES)[number];
  }

  if (KINDS.includes(kind as (typeof KINDS)[number])) {
    where.kind = kind as (typeof KINDS)[number];
  }

  if (due === "DUE") {
    where.dueAt = {
      lte: new Date(),
    };
  }

  if (due === "FUTURE") {
    where.dueAt = {
      gt: new Date(),
    };
  }

  if (q) {
    where.OR = [
      {
        term: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        normalized: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        meaning: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        plainEnglish: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  const [words, totalWords] = await db.$transaction([
    db.word.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.word.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalWords / PAGE_SIZE));

  function pageHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    if (q) nextParams.set("q", q);
    if (status !== "ACTIVE") nextParams.set("status", status);
    if (kind !== "ALL") nextParams.set("kind", kind);
    if (due !== "ALL") nextParams.set("due", due);
    nextParams.set("page", String(nextPage));

    return `/words?${nextParams.toString()}`;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="flex items-center font-sans gap-3">
            <Button asChild variant="outline" size="sm">
            <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
            </Link>
            </Button>
          <div>
            <p className="text-sm text-muted-foreground">Vocabulary</p>
            <h1 className="text-2xl font-semibold tracking-tight">Your words</h1>
          </div>
        </header>

        <WordsFilterBar q={q} status={status} kind={kind} due={due} />

        <div className="text-sm text-muted-foreground">
          Showing {words.length} of {totalWords} matching card
          {totalWords === 1 ? "" : "s"}
        </div>

        {words.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No words match these filters.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {words.map((word) => {
              const examples = toStringArray(word.examples);
              const synonyms = toStringArray(word.synonyms);
              const difficultyBadge = getDifficultyBadge(word.difficulty);
              return (
                <Card key={word.id}>
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="break-words text-xl">
                          {word.term}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {word.meaning}
                        </p>
                      </div>

                      <DeleteWordButton wordId={word.id} term={word.term} />
                    </div>

                    <WordMetaBadges
                    badges={[
                        {
                        label: word.kind.replaceAll("_", " "),
                        variant: "secondary",
                        },
                        {
                        label: word.status,
                        variant: "outline",
                        },
                        {
                        label: difficultyBadge.label,
                        variant: "outline",
                        className: difficultyBadge.className,
                        },
                        {
                        label: `Reviewed ${word.reviewCount}x`,
                        variant: "outline",
                        },
                        {
                        label: `Created: ${formatDate(word.createdAt)}`,
                        variant: "outline",
                        },
                        {
                        label: `Due: ${formatDateTime(word.dueAt)}`,
                        variant: "outline",
                        },
                    ]}
                    />
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3">
                    {word.plainEnglish ? (
                      <p className="text-sm">{word.plainEnglish}</p>
                    ) : null}


                    {examples.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Examples
                        </p>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          {examples.slice(0, 2).map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {synonyms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {synonyms.slice(0, 6).map((synonym, index) => (
                          <Badge key={index} variant="outline">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
            >
              Previous
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}