import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="book-card no-underline">
      <div className="book-card-cover-wrapper">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            width={400}
            height={200}
            className="book-card-cover"
          />
        ) : (
          <div className="cover-placeholder"></div>
        )}
      </div>
      <div className="book-card-body">
        <div className="book-card-title">{book.title}</div>
        <div className="book-card-author">{book.author}</div>
        <div className="book-card-meta">
          {book.category && (
            <span className="badge badge-category">{book.category}</span>
          )}
          <span
            className={`badge ${
              book.availableCopies > 0 ? "badge-available" : "badge-unavailable"
            }`}
          >
            {book.availableCopies > 0
              ? `${book.availableCopies} avail.`
              : "Unavailable"}
          </span>
        </div>
      </div>
    </Link>
  );
}
