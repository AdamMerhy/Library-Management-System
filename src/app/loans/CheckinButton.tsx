"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckinButton({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckin() {
    if (!confirm("Check in this book?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/checkin`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to check in");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckin}
      disabled={loading}
      className="btn btn-success btn-sm"
    >
      {loading ? "…" : "Check In"}
    </button>
  );
}
