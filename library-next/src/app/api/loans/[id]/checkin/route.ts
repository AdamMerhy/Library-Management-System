import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const loanId = parseInt(id);
  if (isNaN(loanId)) {
    return NextResponse.json({ error: "Invalid loan ID" }, { status: 404 });
  }

  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }
  if (loan.status !== "Borrowed") {
    return NextResponse.json(
      { error: "Loan is already returned" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "Returned",
        returnedAt: new Date(),
      },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
