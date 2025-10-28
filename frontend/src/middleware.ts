import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const raw = req.cookies.get("auth")?.value;

  if (!raw) return NextResponse.next();

  let role = null;
  let verified = false;
  let completed = false;

  try {
    ({ role, verified, completed } = JSON.parse(decodeURIComponent(raw)));
  } catch (err) {
    return NextResponse.next();
  }

  const path = req.nextUrl.pathname;
  const url = req.nextUrl.clone();

  if (!completed) return NextResponse.next();

  if (role === "admin") {
    if (!path.startsWith("/dashboard-admin")) {
      url.pathname = "/dashboard-admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (role === "client" && !verified) {
    if (path.startsWith("/dashboard-user") || path.startsWith("/dashboard-admin")) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (role === "client" && verified) {
    if (!path.startsWith("/dashboard-user")) {
      url.pathname = "/dashboard-user";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard-user/:path*", "/dashboard-admin/:path*"],
};
