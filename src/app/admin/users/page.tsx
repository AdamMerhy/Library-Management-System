import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
  });

  function roleBadge(r: string) {
    switch (r) {
      case "Admin":
        return "badge-unavailable";
      case "Librarian":
        return "";
      default:
        return "";
    }
  }

  return (
    <>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>User Management</h2>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name ?? "—"}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        user.role === "Admin"
                          ? "#fee2e2"
                          : user.role === "Librarian"
                            ? "#fef9c3"
                            : "#e2e8f0",
                      color:
                        user.role === "Admin"
                          ? "#991b1b"
                          : user.role === "Librarian"
                            ? "#854d0e"
                            : "#475569",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/admin/users/${user.id}/edit-role`}
                    className="btn btn-primary btn-sm"
                  >
                    Change Role
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
