import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const bookId = parseInt(body.bookId);
  const userId = body.userId as string;
  const dueDays = body.dueDays;

  if (isNaN(bookId) || !userId) {
    return NextResponse.json(
      { error: "Book and user are required" },
      { status: 400 }
    );
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.availableCopies <= 0) {
    return NextResponse.json({ error: "No copies available" }, { status: 400 });
  }

  const days = dueDays && dueDays > 0 ? dueDays : 14;

  await prisma.$transaction([
    prisma.loan.create({
      data: {
        bookId,
        borrowedByUserId: userId,
        borrowedAt: new Date(),
        dueAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
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
