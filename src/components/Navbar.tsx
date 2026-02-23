"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user as any;
  const role = user?.role ?? "Member";
  const isLoggedIn = !!user;
  const isAdmin = role === "Admin";
  const isStaff = role === "Admin" || role === "Librarian";

  function navClass(href: string) {
    return `nav-link${pathname === href ? " active" : ""}`;
  }

  return (
    <nav className="navbar">
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "0 1rem" }}>
        <Link href="/" className="no-underline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
          Mini Library
        </Link>

        {/* Mobile toggle */}
        <button
          className="sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{ color: "white", fontSize: "1.5rem", background: "transparent", border: "none", cursor: "pointer" }}
        >
          &#9776;
        </button>

        <div
          className={`${menuOpen ? "flex" : "hidden"} sm:flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0 absolute sm:static left-0 right-0 sm:top-auto p-4 sm:p-0 z-50 sm:z-auto w-full sm:w-auto`}
          style={{
            top: "3rem",
            ...(menuOpen ? { background: "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}),
          }}
        >
          {/* Left links */}
          <div className="flex flex-col sm:flex-row gap-0.5">
            <Link href="/" className={navClass("/")} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/books" className={navClass("/books")} onClick={() => setMenuOpen(false)}>
              Books
            </Link>
            {isLoggedIn && !isStaff && (
              <Link href="/my-loans" className={navClass("/my-loans")} onClick={() => setMenuOpen(false)}>
                My Loans
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/search/ai" className={navClass("/search/ai")} onClick={() => setMenuOpen(false)}>
                AI Search
              </Link>
            )}
            {isStaff && (
              <Link href="/loans" className={navClass("/loans")} onClick={() => setMenuOpen(false)}>
                Loans
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/users" className={navClass("/admin/users")} onClick={() => setMenuOpen(false)}>
                Users
              </Link>
            )}
          </div>

          {/* Right links */}
          <div className="flex items-center gap-2 sm:ml-auto mt-2 sm:mt-0">
            {isLoggedIn ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", padding: "0 0.5rem", fontWeight: 500 }}>{user.name ?? user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn btn-outline-light btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={navClass("/login")} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
