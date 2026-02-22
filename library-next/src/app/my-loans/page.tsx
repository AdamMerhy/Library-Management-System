import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function MyLoansPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/login");

  const loans = await prisma.loan.findMany({
    where: { borrowedByUserId: user.id },
    include: { book: true },
    orderBy: { borrowedAt: "desc" },
  });

  return (
    <>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>My Loans</h2>

      {loans.length === 0 ? (
        <div className="alert alert-success">
          You haven&apos;t borrowed any books yet.{" "}
          <Link href="/books" className="underline">
            Browse books
          </Link>{" "}
          to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {loans.map((loan, i) => {
            const isOverdue =
              loan.status === "Borrowed" &&
              loan.dueAt &&
              new Date(loan.dueAt) < new Date();

            return (
              <div
                key={loan.id}
                className={`loan-card ${isOverdue ? "border-red-400" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {loan.book.coverImageUrl ? (
                  <Image
                    src={loan.book.coverImageUrl}
                    alt={loan.book.title}
                    width={60}
                    height={80}
                    className="loan-card-cover"
                  />
                ) : (
                  <div className="loan-card-cover-placeholder"></div>
                )}
                <div className="flex-1">
                  <Link
                    href={`/books/${loan.bookId}`}
                    className="no-underline"
                    style={{ fontWeight: 700, color: "var(--text)" }}
                  >
                    {loan.book.title}
                  </Link>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Borrowed{" "}
                    {new Date(loan.borrowedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {loan.dueAt && (
                      <span>
                        {" "}
                        · Due{" "}
                        {new Date(loan.dueAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {loan.returnedAt && (
                      <span>
                        {" "}
                        · Returned{" "}
                        {new Date(loan.returnedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
