import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const raw = req.cookies.get("auth")?.value;
  const path = req.nextUrl.pathname;
  const url = req.nextUrl.clone();

  if (!raw) return NextResponse.next();

  let role = null;
  let verified = false;
  let completed = false;

  try {
    ({ role, verified, completed } = JSON.parse(decodeURIComponent(raw)));
  } catch (err) {
    return NextResponse.next();
  }

  if (!completed) {
    if (path !== "/") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (path === "/") {
    if (role === "admin") {
      url.pathname = "/dashboard-admin";
      return NextResponse.redirect(url);
    }
    if (role === "client" && verified) {
      url.pathname = "/dashboard-user";
      return NextResponse.redirect(url);
    }
  }

  if (role === "admin") {
    const adminPaths = [
      "/dashboard-admin",
      "/stocks-administration",
      "/stock-approval",
      "/access",
      "/user-administration",
      "/transactionsAdmin",
      "/create-admin-user",
      "/user-overview",
      "/user-with",
    ];

    const isAdminRoute = adminPaths.some((p) => path.startsWith(p));
    if (!isAdminRoute) {
      url.pathname = "/dashboard-admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (role === "client" && !verified) {
    const forbiddenPaths = [
      "/dashboard-user",
      "/dashboard-admin",
      "/stocks",
      "/portfolio",
      "/history",
      "/report",
      "/purchase",
      "/sale",
    ];
    if (forbiddenPaths.some((p) => path.startsWith(p))) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (role === "client" && verified) {
    const clientPaths = [
      "/dashboard-user",
      "/stocks",
      "/portfolio",
      "/history",
      "/report",
      "/purchase",
      "/sale",
    ];

    const isClientRoute = clientPaths.some((p) => path.startsWith(p));
    if (!isClientRoute) {
      url.pathname = "/dashboard-user";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (path !== "/") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard-user/:path*",
    "/dashboard-admin/:path*",
    "/stocks/:path*",
    "/portfolio/:path*",
    "/history/:path*",
    "/report/:path*",
    "/purchase/:path*",
    "/sale/:path*",
    "/stocks-administration/:path*",
    "/stock-approval/:path*",
    "/access/:path*",
    "/user-administration/:path*",
    "/transactionsAdmin/:path*",
    "/create-admin-user/:path*",
    "/user-overview/:path*",
    "/user-with/:path*",
  ],
};
