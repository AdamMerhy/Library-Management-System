import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="hero" style={{ marginBottom: "2rem" }}>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.75rem", letterSpacing: "-0.03em", position: "relative" }}>Mini Library</h1>
      <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", position: "relative" }}>
        Discover, borrow, and manage your favourite books — all in one place.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", position: "relative" }}>
        <Link href="/books" className="btn btn-light btn-lg" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          Browse Books
        </Link>
        {isLoggedIn ? (
          <Link href="/search/ai" className="btn btn-outline-light btn-lg" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
            AI Search
          </Link>
        ) : (
          <Link href="/login" className="btn btn-outline-light btn-lg" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
