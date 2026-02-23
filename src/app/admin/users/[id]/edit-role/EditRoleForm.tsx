"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

const ALL_ROLES = ["Admin", "Librarian", "Member"];

export default function EditRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const selectedRole = formData.get("selectedRole") as string;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to update role");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">New Role</label>
        <select
          name="selectedRole"
          className="form-select"
          defaultValue={currentRole}
          required
        >
          <option value="">-- Select a role --</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving…" : "Save"}
        </button>
        <Link href="/admin/users" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
