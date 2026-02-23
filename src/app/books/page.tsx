import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import type { Book } from "@/types";

interface Props {
  searchParams: Promise<{
    searchTerm?: string;
    category?: string;
    availableOnly?: string;
    publishYearMin?: string;
    publishYearMax?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function BooksPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();
  const role = (session?.user as any)?.role;
  const isStaff = role === "Admin" || role === "Librarian";

  const searchTerm = params.searchTerm ?? "";
  const category = params.category ?? "";
  const availableOnly = params.availableOnly === "true";
  const publishYearMin = params.publishYearMin ? parseInt(params.publishYearMin) : undefined;
  const publishYearMax = params.publishYearMax ? parseInt(params.publishYearMax) : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const pageSize = parseInt(params.pageSize ?? "10");

  // Build Prisma where clause
  const where: any = {};
  const conditions: any[] = [];

  if (searchTerm) {
    conditions.push({
      OR: [
        { title: { contains: searchTerm } },
        { author: { contains: searchTerm } },
        { isbn: { contains: searchTerm } },
        { category: { contains: searchTerm } },
        { tags: { contains: searchTerm } },
      ],
    });
  }

  if (category) {
    conditions.push({ category });
  }

  if (availableOnly) {
    conditions.push({ availableCopies: { gt: 0 } });
  }

  if (publishYearMin) {
    conditions.push({ publishYear: { gte: publishYearMin } });
  }

  if (publishYearMax) {
    conditions.push({ publishYear: { lte: publishYearMax } });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const totalCount = await prisma.book.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);

  const books = await prisma.book.findMany({
    where,
    orderBy: { title: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const categories = await prisma.book.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categoryList = categories.map((c) => c.category!).filter(Boolean);

  // Build pagination query string helper
  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (searchTerm) sp.set("searchTerm", searchTerm);
    if (category) sp.set("category", category);
    if (availableOnly) sp.set("availableOnly", "true");
    if (publishYearMin) sp.set("publishYearMin", String(publishYearMin));
    if (publishYearMax) sp.set("publishYearMax", String(publishYearMax));
    sp.set("pageSize", String(pageSize));
    sp.set("page", String(p));
    return `/books?${sp.toString()}`;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Books</h2>
        {isStaff && (
          <Link href="/books/create" className="btn btn-primary">
            + Add Book
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <form method="get" action="/books">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Search</label>
              <input
                type="text"
                name="searchTerm"
                defaultValue={searchTerm}
                className="form-control"
                placeholder="Title, Author, ISBN, Tags..."
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</label>
              <select name="category" defaultValue={category} className="form-select">
                <option value="">All</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Year Min</label>
              <input
                type="number"
                name="publishYearMin"
                defaultValue={publishYearMin ?? ""}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Year Max</label>
              <input
                type="number"
                name="publishYearMax"
                defaultValue={publishYearMax ?? ""}
                className="form-control"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                name="availableOnly"
                value="true"
                defaultChecked={availableOnly}
                id="availOnly"
                style={{ accentColor: "var(--primary)", width: "1rem", height: "1rem" }}
              />
              <label htmlFor="availOnly" className="text-sm">Available Only</label>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Per Page</label>
              <select name="pageSize" defaultValue={pageSize} className="form-select">
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{totalCount} book(s) found</p>

      {books.length === 0 ? (
        <div className="alert alert-success">No books found matching your filters.</div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", width: "100%" }}>
            {books.map((book) => (
              <div key={book.id} style={{ flex: "0 0 auto", width: "calc(33.333% - 0.84rem)", minWidth: "220px" }}>
                <BookCard book={book as unknown as Book} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-4 flex justify-center">
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`page-link${p === page ? " active" : ""}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
