import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/editor", "/admin", "/api-key", "/playground", "/api-integration"];
const authPaths = ["/sign-in", "/sign-up"];

function hasAuthSession(req: NextRequest): boolean {
  // Check for NextAuth v5 session cookie
  const nextAuthCookie =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (nextAuthCookie) return true;

  // Check for Supabase auth cookie (sb-<project-ref>-auth-token)
  const supabaseCookies = req.cookies.getAll();
  const hasSupabase = supabaseCookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  return hasSupabase;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = hasAuthSession(req);

  if (pathname === "/api-integration") {
    const playgroundUrl = req.nextUrl.clone();
    playgroundUrl.pathname = "/playground";
    return NextResponse.redirect(playgroundUrl);
  }

  // Redirect to sign-in if accessing protected route without auth
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !isAuthed) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if already authed and trying to access auth pages
  const isAuthPage = authPaths.some((p) => pathname === p);
  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard, editor, admin, and auth pages
    // Exclude API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.).*)",
  ],
};
