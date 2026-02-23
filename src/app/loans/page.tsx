import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckinButton from "./CheckinButton";

export default async function LoansPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/");

  const loans = await prisma.loan.findMany({
    include: { book: true, borrowedByUser: true },
    orderBy: { borrowedAt: "desc" },
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Loans</h2>
        <Link href="/loans/checkout" className="btn btn-primary">
          + Check Out a Book
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="alert alert-success">No loans recorded yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Borrowed</th>
                <th>Due</th>
                <th>Returned</th>
                <th>Status</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const isOverdue =
                  loan.status === "Borrowed" &&
                  loan.dueAt &&
                  new Date(loan.dueAt) < new Date();
                return (
                  <tr
                    key={loan.id}
                    className={isOverdue ? "bg-red-50" : ""}
                  >
                    <td>
                      <Link
                        href={`/books/${loan.bookId}`}
                        className="no-underline"
                        style={{ color: "var(--primary)" }}
                      >
                        {loan.book.title}
                      </Link>
                    </td>
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
                        ? new Date(loan.returnedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td>
                      {loan.status === "Borrowed" ? (
                        <span
                          className={`badge ${isOverdue ? "badge-unavailable" : ""}`}
                          style={
                            !isOverdue
                              ? { background: "#fef9c3", color: "#854d0e" }
                              : undefined
                          }
                        >
                          {isOverdue ? "Overdue" : "Borrowed"}
                        </span>
                      ) : (
                        <span className="badge badge-available">Returned</span>
                      )}
                    </td>
                    <td>
                      {loan.status === "Borrowed" && (
                        <CheckinButton loanId={String(loan.id)} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
