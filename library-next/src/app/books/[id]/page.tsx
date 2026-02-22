import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BorrowButton from "./BorrowButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: Props) {
  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) notFound();
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) notFound();

  const session = await auth();
  const user = session?.user as any;
  const isLoggedIn = !!user;
  const isStaff = user?.role === "Admin" || user?.role === "Librarian";

  const tags = book.tags
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginTop: "0.5rem" }}>
      <div style={{ textAlign: "center" }}>
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            width={300}
            height={400}
            className="detail-cover"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          />
        ) : (
          <div className="detail-cover-placeholder" style={{ marginLeft: "auto", marginRight: "auto" }}></div>
        )}
      </div>
      <div className="md:col-span-2 detail-info">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{book.title}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1rem" }}>by {book.author}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {book.category && (
            <span className="badge badge-category">{book.category}</span>
          )}
          {tags?.map((tag) => (
            <span
              key={tag}
              className="badge"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: "1.5rem" }}>
          <div>
            <dt>ISBN</dt>
            <dd>{book.isbn ?? "—"}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{book.language ?? "—"}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{book.publishYear ?? "—"}</dd>
          </div>
          <div>
            <dt>Shelf</dt>
            <dd>{book.locationShelf ?? "—"}</dd>
          </div>
        </div>

        {book.description && (
          <div style={{ marginBottom: "1.5rem" }}>
            <dt>Description</dt>
            <dd style={{ lineHeight: 1.7 }}>{book.description}</dd>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <span
            className={`badge ${
              book.availableCopies > 0 ? "badge-available" : "badge-unavailable"
            }`}
            style={{ fontSize: "0.85rem", padding: "0.4em 0.8em" }}
          >
            {book.availableCopies} available / {book.totalCopies} total
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link href="/books" className="btn btn-secondary">
            ← Back
          </Link>

          {isLoggedIn && book.availableCopies > 0 && (
            <BorrowButton bookId={String(book.id)} />
          )}

          {isStaff && (
            <>
              <Link href={`/books/${String(book.id)}/edit`} className="btn btn-primary">
                Edit
              </Link>
              <Link
                href={`/loans/history/${String(book.id)}`}
                className="btn btn-secondary"
              >
                Loan History
              </Link>
              <Link href={`/books/${String(book.id)}/delete`} className="btn btn-danger">
                Delete
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
