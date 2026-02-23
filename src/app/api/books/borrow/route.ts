import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const bookId = parseInt(body.bookId);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.availableCopies <= 0) {
    return NextResponse.json({ error: "No copies available" }, { status: 400 });
  }

  // Create loan and decrement available copies
  await prisma.$transaction([
    prisma.loan.create({
      data: {
        bookId,
        borrowedByUserId: user.id,
        borrowedAt: new Date(),
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "Borrowed",
      },
    }),
    prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
