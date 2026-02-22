import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/");

  const books = await prisma.book.findMany({
    where: { availableCopies: { gt: 0 } },
    orderBy: { title: "asc" },
    select: { id: true, title: true, author: true },
  });

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { id: true, email: true, name: true },
  });

  return (
    <>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>Check Out a Book</h2>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="card">
          <div className="card-body">
            <CheckoutForm
              books={books.map((b) => ({
                id: String(b.id),
                label: `${b.title} — ${b.author}`,
              }))}
              users={users.map((u) => ({
                id: u.id,
                label: u.name ? `${u.name} (${u.email})` : u.email!,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
