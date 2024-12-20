import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const refreshTokenCookie = req.cookies.get("refreshToken");
  const registrationInitiatedCookie = req.cookies.get("registration_initiated");

  const refreshToken = refreshTokenCookie?.value;
  const registrationInitiated = registrationInitiatedCookie?.value;

  console.log(refreshToken, "refreshToken in the middleware");
  console.log(
    registrationInitiated,
    "registration_initiated in the middleware"
  );

  let userRole = null;

  if (refreshToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(refreshToken, secret);
      console.log(payload, "Payload from token");
      userRole = payload.role;
      console.log(userRole, "User role in middleware");

      // Redirect to the appropriate dashboard if the user visits the landing page (`/`)
      if (req.nextUrl.pathname === "/") {
        if (userRole === "streamer") {
          return NextResponse.redirect(new URL("/dashboard/streamer", req.url));
        } else if (userRole === "viewer") {
          return NextResponse.redirect(new URL("/dashboard/viewer", req.url));
        } else if (userRole === "admin") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }
      }
    } catch (err: any) {
      console.error("Invalid or expired token:", err.message);
      return NextResponse.redirect(new URL("/sign-in/viewer", req.url));
    }
  }

  // Redirect unauthenticated users trying to access protected paths
  if (!refreshToken) {
    const protectedPaths = [
      "/dashboard/streamer",
      "/dashboard/viewer",
      "/dashboard/viewer/main",
      "/profile",
    ];
    if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/sign-in/viewer", req.url));
    }
  }

  // Allow Google OAuth callback to pass
  if (req.nextUrl.pathname.startsWith("/api/auth/callback/google")) {
    return NextResponse.next();
  }

  // Protect registration-related paths
  const registrationProtectedPaths = ["/otp-verification", "/change-password"];
  if (
    !registrationInitiated &&
    registrationProtectedPaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    )
  ) {
    return NextResponse.redirect(new URL("/sign-in/viewer", req.url));
  }

  // Redirect logged-in users away from auth pages to their dashboard
  const authPaths = ["/sign-up", "/sign-in/viewer", "/sign-in/streamer"];
  if (
    refreshToken &&
    authPaths.some((path) => req.nextUrl.pathname.startsWith(path))
  ) {
    if (userRole === "streamer") {
      return NextResponse.redirect(new URL("/dashboard/streamer", req.url));
    } else if (userRole === "viewer") {
      return NextResponse.redirect(new URL("/dashboard/viewer", req.url));
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
  }

  // Role-based redirection for dashboards
  if (refreshToken && req.nextUrl.pathname.startsWith("/dashboard")) {
    if (
      userRole === "streamer" &&
      !req.nextUrl.pathname.startsWith("/dashboard/streamer")
    ) {
      return NextResponse.redirect(new URL("/dashboard/streamer", req.url));
    } else if (
      userRole === "viewer" &&
      !req.nextUrl.pathname.startsWith("/dashboard/viewer")
    ) {
      return NextResponse.redirect(new URL("/dashboard/viewer", req.url));
    } else if (
      userRole === "admin" &&
      !req.nextUrl.pathname.startsWith("/dashboard/admin")
    ) {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
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
    "/", 
  ],
};
