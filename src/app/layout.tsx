import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Mini Library",
  description: "Discover, borrow, and manage your favourite books — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <header>
            <Navbar />
          </header>
          <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", padding: "1.5rem 1rem", flex: 1 }}>
            <main role="main" style={{ paddingBottom: "1rem" }}>
              {children}
            </main>
          </div>
          <footer style={{ padding: "1rem 0", marginTop: "1.5rem" }}>
            <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", padding: "0 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              &copy; {new Date().getFullYear()} Mini Library Management System
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
