import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import BookForm from "@/components/BookForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: Props) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/books");

  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) notFound();
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) notFound();

  return (
    <BookForm
      mode="edit"
      initialData={{
        id: String(book.id),
        title: book.title,
        author: book.author,
        isbn: book.isbn ?? "",
        category: book.category ?? "",
        tags: book.tags ?? "",
        description: book.description ?? "",
        publishYear: book.publishYear,
        language: book.language ?? "",
        locationShelf: book.locationShelf ?? "",
        coverImageUrl: book.coverImageUrl ?? "",
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
      }}
    />
  );
}
