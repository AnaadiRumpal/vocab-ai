import Link from "next/link";
import { Prisma } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { WordsFilterBar } from "@/components/words-filter-bar";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WordCard } from "@/components/word-card";
import { LoadingLinkButton } from "@/components/loading-link-button";

const PAGE_SIZE = 10;

const STATUSES = [
  "NEW",
  "LEARNING",
  "REVIEWING",
  "MASTERED",
  "ARCHIVED",
] as const;

const KINDS = [
  "WORD",
  "PHRASE",
  "IDIOM",
  "PHRASAL_VERB",
  "TECHNICAL_TERM",
  "OTHER",
] as const;

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
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

  const page =
    Number.isFinite(pageParam) && pageParam > 0
      ? pageParam
      : 1;

  const where: Prisma.WordWhereInput = {
    userId,
  };

  if (status === "ACTIVE") {
    where.status = {
      not: "ARCHIVED",
    };
  } else if (
    STATUSES.includes(status as (typeof STATUSES)[number])
  ) {
    where.status = status as (typeof STATUSES)[number];
  }

  if (
    KINDS.includes(kind as (typeof KINDS)[number])
  ) {
    where.kind = kind as (typeof KINDS)[number];
  }
  const now = new Date();

  if (due === "DUE") {
    where.dueAt = {
      lte:  new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          )
    };
  }

  if (due === "FUTURE") {
    where.dueAt = {
      gt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          )
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

    db.word.count({
      where,
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalWords / PAGE_SIZE)
  );

  function pageHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    if (q) nextParams.set("q", q);

    if (status !== "ACTIVE") {
      nextParams.set("status", status);
    }

    if (kind !== "ALL") {
      nextParams.set("kind", kind);
    }

    if (due !== "ALL") {
      nextParams.set("due", due);
    }

    nextParams.set("page", String(nextPage));

    return `/words?${nextParams.toString()}`;
  }

  return (
        <main
          className="
            min-h-screen
            bg-background
            text-foreground
            dark:bg-background
            dark:text-foreground
            px-4 py-6
          "
        >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="flex items-center gap-3">
          <LoadingLinkButton
            href="/"
            variant="outline"
            size="sm"
            className="
              inline-flex cursor-pointer items-center gap-2
            "
          >
            <>
              <ArrowLeft className="h-4 w-4" />
              Home
            </>
          </LoadingLinkButton>

          <div>
            <p className="text-sm text-muted-foreground">
              Vocabulary
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Your words
            </h1>
          </div>
        </header>
        <WordsFilterBar
          q={q}
          status={status}
          kind={kind}
          due={due}
        />

        <div className="text-sm text-muted-foreground">
          Showing {words.length} of {totalWords} matching
          card{totalWords === 1 ? "" : "s"}
        </div>

        {words.length === 0 ? (
          <Card>
            <CardContent
              className="
                py-10 text-center
                text-sm text-muted-foreground
              "
            >
              No words match these filters.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {words.map((word) => {
              const examples = toStringArray(
                word.examples
              );

              const synonyms = toStringArray(
                word.synonyms
              );

              return (
                <WordCard
                  key={word.id}
                  word={{
                    id: word.id,
                    term: word.term,
                    kind: word.kind,
                    meaning: word.meaning,
                    plainEnglish: word.plainEnglish,
                    examples,
                    synonyms,
                    mnemonic: word.mnemonic,
                    difficulty: word.difficulty,
                    status: word.status,
                    reviewCount: word.reviewCount,
                    createdAt: word.createdAt,
                    dueAt: word.dueAt,
                  }}
                  showDelete
                  showMeta
                />
              );
            })}
          </div>
        )}

        <div
          className="
            flex items-center
            justify-between gap-3
          "
        >
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1)}>
                Previous
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1)}>
                Next
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  );
}