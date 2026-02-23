import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoanHistoryPage({ params }: Props) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/");

  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) notFound();
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) notFound();

  const loans = await prisma.loan.findMany({
    where: { bookId: bookId },
    include: { borrowedByUser: true },
    orderBy: { borrowedAt: "desc" },
  });

  return (
    <>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Loan History</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
        <strong>{book.title}</strong> by {book.author} —{" "}
        {book.availableCopies} / {book.totalCopies} copies available
      </p>

      {loans.length === 0 ? (
        <div className="alert alert-success">
          No loans recorded for this book.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Borrowed</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.borrowedByUser?.email ?? "—"}</td>
                  <td>
                    {new Date(loan.borrowedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {loan.dueAt
                      ? new Date(loan.dueAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    {loan.returnedAt
                      ? new Date(loan.returnedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        loan.status === "Borrowed" ? "" : "badge-available"
                      }`}
                      style={
                        loan.status === "Borrowed"
                          ? { background: "#fef9c3", color: "#854d0e" }
                          : undefined
                      }
                    >
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/loans" className="btn btn-secondary mt-3">
        ← Back to Loans
      </Link>
    </>
  );
}
