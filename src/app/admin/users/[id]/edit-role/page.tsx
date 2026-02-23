import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EditRoleForm from "./EditRoleForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: Props) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin") redirect("/");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Change Role</h2>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="card">
          <div className="card-body">
            <dl className="mb-3">
              <dt>Email</dt>
              <dd>{user.email}</dd>
              <dt>Full Name</dt>
              <dd>{user.name ?? "—"}</dd>
              <dt>Current Role</dt>
              <dd>{user.role}</dd>
            </dl>

            <EditRoleForm userId={user.id} currentRole={user.role} />
          </div>
        </div>
      </div>
    </>
  );
}
