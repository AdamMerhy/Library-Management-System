import type { Book, AiSearchFilters } from "@/types";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Counts how many distinct keywords appear anywhere in the book's searchable text.
 * Books matching more keywords are ranked higher.
 */
export function computeRelevanceScore(
  book: Book,
  keywords: string[]
): number {
  const searchableText = [
    book.title,
    book.author,
    book.description ?? "",
    book.tags ?? "",
    book.category ?? "",
  ]
    .join("\n")
    .toLowerCase();

  return keywords.filter((kw) =>
    searchableText.includes(kw.toLowerCase())
  ).length;
}

/**
 * Search books by AI-generated filters — mirrors BookService.SearchByFiltersAsync.
 */
export async function searchByFilters(f: AiSearchFilters): Promise<Book[]> {
  const conditions: Prisma.BookWhereInput[] = [];

  if (f.title) {
    conditions.push({ title: { contains: f.title } });
  }
  if (f.author) {
    conditions.push({ author: { contains: f.author } });
  }
  if (f.isbn) {
    conditions.push({ isbn: { contains: f.isbn } });
  }
  if (f.category) {
    conditions.push({ category: { contains: f.category } });
  }
  if (f.language) {
    conditions.push({ language: { contains: f.language } });
  }
  if (f.availableOnly) {
    conditions.push({ availableCopies: { gt: 0 } });
  }
  if (f.publishYearMin != null) {
    conditions.push({ publishYear: { gte: f.publishYearMin } });
  }
  if (f.publishYearMax != null) {
    conditions.push({ publishYear: { lte: f.publishYearMax } });
  }

  // Merge keywords + tags into a single list (OR logic)
  const allTerms: string[] = [];
  if (f.keywords?.length) allTerms.push(...f.keywords);
  if (f.tags?.length) allTerms.push(...f.tags);

  if (allTerms.length > 0) {
    // Build OR predicate across title, author, description, tags, category for each keyword
    const keywordConditions = allTerms.map((kw) => ({
      OR: [
        { title: { contains: kw } },
        { author: { contains: kw } },
        { description: { contains: kw } },
        { tags: { contains: kw } },
        { category: { contains: kw } },
      ],
    }));
    // Any keyword matching = include the book (OR across all keywords)
    conditions.push({ OR: keywordConditions });
  }

  const where: Prisma.BookWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const limit = f.limit && f.limit > 0 ? f.limit : 20;

  // When multiple keywords exist, over-fetch and re-rank by relevance
  if (allTerms.length > 1) {
    const candidates = await prisma.book.findMany({
      where,
      take: limit * 3,
    });

    return candidates
      .sort((a, b) => {
        const scoreA = computeRelevanceScore(a as Book, allTerms);
        const scoreB = computeRelevanceScore(b as Book, allTerms);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.title.localeCompare(b.title);
      })
      .slice(0, limit);
  }

  const orderBy: Prisma.BookOrderByWithRelationInput =
    f.sortBy?.toLowerCase() === "title"
      ? { title: "asc" }
      : f.sortBy?.toLowerCase() === "year"
        ? { publishYear: "desc" }
        : { title: "asc" };

  return await prisma.book.findMany({
    where,
    orderBy,
    take: limit,
  });
}
