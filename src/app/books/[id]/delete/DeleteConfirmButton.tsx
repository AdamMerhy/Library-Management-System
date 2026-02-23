"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteConfirmButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/books");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-danger"
    >
      {loading ? "Deleting…" : "Yes, Delete"}
    </button>
  );
}
