import { NextRequest, NextResponse } from "next/server";

// export { auth as middleware } from "@/auth"
export function middleware(req: NextRequest) {
  const token = req.cookies.get("refreshToken");
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Protect these routes
};
