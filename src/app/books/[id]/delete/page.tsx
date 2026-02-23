import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import DeleteConfirmButton from "./DeleteConfirmButton";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DeleteBookPage({ params }: Props) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/books");

  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) notFound();
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) notFound();

  const hasActiveLoans = book.availableCopies < book.totalCopies;

  return (
    <div className="form-page">
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>Delete Book</h2>

      {hasActiveLoans ? (
        <div className="alert alert-danger">
          <strong>Cannot delete.</strong> This book has{" "}
          <strong>{book.totalCopies - book.availableCopies}</strong>{" "}
          copy/copies currently borrowed. All copies must be returned before
          deletion.
        </div>
      ) : (
        <div className="alert" style={{ background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" }}>
          Are you sure you want to delete this book? This action cannot be
          undone.
        </div>
      )}

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-body flex gap-3">
          {book.coverImageUrl ? (
            <Image
              src={book.coverImageUrl}
              alt={book.title}
              width={80}
              height={110}
              className="rounded-lg object-cover"
              style={{ width: 80, height: 110 }}
            />
          ) : (
            <div className="loan-card-cover-placeholder" style={{ width: 80, height: 110, fontSize: "2rem" }}>
            </div>
          )}
          <div>
            <h5 className="font-bold mb-1">{book.title}</h5>
            <p className="text-[var(--text-muted)] mb-1">{book.author}</p>
            <small className="text-[var(--text-muted)]">
              {book.isbn ?? "No ISBN"} · {book.category ?? "Uncategorised"}
            </small>
            <div className="mt-2">
              <span
                className={`badge ${hasActiveLoans ? "badge-unavailable" : "badge-available"}`}
              >
                {book.availableCopies} / {book.totalCopies} copies
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {!hasActiveLoans && <DeleteConfirmButton bookId={String(book.id)} />}
        <Link href="/books" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </div>
  );
}
