"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error ?? "Registration failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "3rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="card-header" style={{ textAlign: "center", fontSize: "1.05rem" }}>Register</div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.1rem" }}>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                className="form-control"
                required
                autoFocus
              />
            </div>
            <div style={{ marginBottom: "1.1rem" }}>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control"
                required
              />
            </div>
            <div style={{ marginBottom: "1.1rem" }}>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                required
                minLength={6}
              />
            </div>
            <div style={{ marginBottom: "1.1rem" }}>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className="form-control"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? "Registering…" : "Register"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
