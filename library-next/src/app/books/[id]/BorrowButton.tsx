"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BorrowButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBorrow() {
    if (!confirm("Borrow this book for 14 days?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/books/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        alert(data.error ?? "Failed to borrow");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBorrow}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? "Borrowing…" : "Borrow This Book"}
    </button>
  );
}
