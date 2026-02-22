import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { interpretAiSearch } from "@/lib/ai-search";
import { searchByFilters } from "@/lib/book-search";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import type { Book, AiSearchFilters } from "@/types";

interface Props {
  searchParams: Promise<{ prompt?: string }>;
}

export default async function AiSearchPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const prompt = params.prompt ?? "";

  let explanation: string | null = null;
  let usedFallback = false;
  let filters: AiSearchFilters | null = null;
  let results: Book[] = [];

  if (prompt) {
    const aiResult = await interpretAiSearch(prompt);
    explanation = aiResult.explanation;
    usedFallback = aiResult.usedFallback;
    filters = aiResult.filters;
    results = (await searchByFilters(filters)) as unknown as Book[];
  }

  return (
    <div className="form-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>AI-Powered Search</h2>
        <Link href="/books" className="btn btn-secondary">
          ← Back to Books
        </Link>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-body">
          <form method="get" action="/search/ai">
            <label className="form-label" style={{ marginBottom: "0.5rem" }}>
              Describe the books you&apos;re looking for
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                name="prompt"
                defaultValue={prompt}
                className="form-control"
                placeholder="e.g. Science fiction books by Isaac Asimov published after 1970"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {explanation && (
        <div className="filter-bar" style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>AI understood: </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{explanation}</span>
            {usedFallback && (
              <span
                className="badge"
                style={{ background: "#fef9c3", color: "#854d0e", marginLeft: "0.5rem" }}
              >
                Fallback
              </span>
            )}
          </div>
        </div>
      )}

      {filters && (
        <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {filters.title && (
            <span className="badge badge-category">Title: {filters.title}</span>
          )}
          {filters.author && (
            <span className="badge badge-category">
              Author: {filters.author}
            </span>
          )}
          {filters.category && (
            <span className="badge badge-category">
              Category: {filters.category}
            </span>
          )}
          {filters.publishYearMin != null && (
            <span className="badge badge-category">
              From: {filters.publishYearMin}
            </span>
          )}
          {filters.publishYearMax != null && (
            <span className="badge badge-category">
              To: {filters.publishYearMax}
            </span>
          )}
          {filters.availableOnly && (
            <span className="badge badge-available">Available only</span>
          )}
          {filters.keywords?.map((kw) => (
            <span key={kw} className="badge badge-category">
              {kw}
            </span>
          ))}
        </div>
      )}

      {prompt && results.length > 0 && (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {results.length} book(s) found
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", width: "100%" }}>
            {results.map((book) => (
              <div key={book.id} style={{ flex: "0 0 auto", width: "calc(33.333% - 0.84rem)", minWidth: "220px" }}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </>
      )}

      {prompt && results.length === 0 && explanation && (
        <div className="alert alert-success">
          No books found matching your search. Try rephrasing your query.
        </div>
      )}
    </div>
  );
}
