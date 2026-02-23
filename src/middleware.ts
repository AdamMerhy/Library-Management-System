import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let token = null;
  try {
    token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch {
    // Token decode failed — treat as not logged in
  }

  const isLoggedIn = !!token;
  const role = (token?.role as string) ?? "Member";

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
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (staffRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "Admin" && role !== "Librarian") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

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
