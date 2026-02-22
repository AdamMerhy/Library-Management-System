import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const isLoggedIn = !!user;

  // Protected routes that require login
  const authRoutes = ["/my-loans", "/search/ai"];
  // Admin-only routes
  const adminRoutes = ["/admin"];
  // Admin + Librarian routes
  const staffRoutes = ["/loans"];

  if (authRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (user.role !== "Admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (staffRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (user.role !== "Admin" && user.role !== "Librarian") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/my-loans/:path*",
    "/search/:path*",
    "/admin/:path*",
    "/loans/:path*",
    "/books/create",
    "/books/:id/edit",
    "/books/:id/delete",
  ],
};
