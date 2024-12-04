import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken");
  const registrationInitiated = req.cookies.get("registration_initiated");

  console.log(refreshToken, "refreshToken in the middleware");
  console.log(registrationInitiated, "registration_initiated in the middleware");

  if (!refreshToken) {
    const protectedPaths = ["/dashboard", "/profile"];
    if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/sign-in/viewer", req.url));
    }
  }

  const registrationProtectedPaths = [
    "/otp-verification",
    "/forgot-password",
    "/change-password",
  ];
  if (!registrationInitiated) {
    if (
      registrationProtectedPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
      )
    ) {
      return NextResponse.redirect(new URL("/sign-in/viewer", req.url));
    }
  }
  const authPaths = ["/sign-up", "/sign-in/viewer", "/sign-in/streamer"];
  if (refreshToken && authPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/otp-verification",
    "/forgot-password",
    "/change-password",
    "/sign-in/viewer",
    "/sign-in/streamer",
    "/sign-up",
    "/login",
  ],
};
