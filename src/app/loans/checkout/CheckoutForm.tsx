"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

interface Props {
  books: { id: string; label: string }[];
  users: { id: string; label: string }[];
}

export default function CheckoutForm({ books, users }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      bookId: formData.get("bookId"),
      userId: formData.get("userId"),
      dueDays: parseInt(formData.get("dueDays") as string) || 14,
    };

    try {
      const res = await fetch("/api/loans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/loans");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to check out");
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
        <label htmlFor="bookId" className="form-label">
          Book
        </label>
        <select name="bookId" id="bookId" className="form-select" required>
          <option value="">-- Select a book --</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="userId" className="form-label">
          Member
        </label>
        <select name="userId" id="userId" className="form-select" required>
          <option value="">-- Select a member --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="dueDays" className="form-label">
          Loan Duration (days)
        </label>
        <input
          type="number"
          name="dueDays"
          id="dueDays"
          className="form-control"
          defaultValue={14}
          min={1}
          max={90}
        />
        <small className="text-[var(--text-muted)]">Default is 14 days.</small>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Processing…" : "Check Out"}
        </button>
        <Link href="/loans" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
