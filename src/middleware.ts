import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_USER_COOKIE } from "@/lib/auth/constants";
import { canAccessAdmin } from "@/lib/auth/roles";
import {
  isSupabaseConfigured,
  type DemoUserSession,
} from "@/lib/data/demo-store";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types/database";

const LEARNER_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/activate",
];
const ADMIN_LOGIN_ROUTE = "/admin/login";

const LEARNER_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/search",
  "/onboarding",
];

function isLearnerAuthRoute(pathname: string): boolean {
  return LEARNER_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isActivateRoute(pathname: string): boolean {
  return pathname === "/activate" || pathname.startsWith("/activate/");
}

function isResetPasswordRoute(pathname: string): boolean {
  return (
    pathname === "/reset-password" || pathname.startsWith("/reset-password/")
  );
}

function isAdminLoginRoute(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_ROUTE;
}

function isPublicCertificateRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/certificates/verify/") ||
    pathname === "/verify" ||
    pathname.startsWith("/verify/")
  );
}

function isAdminAppRoute(pathname: string): boolean {
  return (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    !isAdminLoginRoute(pathname)
  );
}

function isLearnerAppRoute(pathname: string): boolean {
  if (isPublicCertificateRoute(pathname)) {
    return false;
  }

  if (pathname === "/certificates" || pathname.startsWith("/certificates/")) {
    return true;
  }

  if (pathname.includes("/lesson/") || pathname.endsWith("/quiz") || pathname.endsWith("/complete")) {
    return pathname.startsWith("/courses/");
  }

  return LEARNER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectTo(request: NextRequest, pathname: string, next?: string) {
  const url = new URL(pathname, request.url);
  if (next && next !== pathname) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

async function getUserRole(
  request: NextRequest,
  response: NextResponse,
): Promise<{ userId: string | null; role: UserRole | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { userId: null, role: null };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: (profile?.role as UserRole | undefined) ?? "customer",
  };
}

function getDemoUserFromRequest(request: NextRequest): DemoUserSession | null {
  const raw = request.cookies.get(DEMO_USER_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoUserSession;
  } catch {
    return null;
  }
}

function gateRequest(
  request: NextRequest,
  response: NextResponse,
  userId: string | null,
  role: UserRole | null,
) {
  const { pathname } = request.nextUrl;
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const staff = canAccessAdmin(role);

  if (isActivateRoute(pathname) || isResetPasswordRoute(pathname)) {
    return response;
  }

  if (isLearnerAuthRoute(pathname) || isAdminLoginRoute(pathname)) {
    if (!userId) {
      return response;
    }
    if (staff) {
      return redirectTo(request, "/admin/dashboard");
    }
    if (isAdminLoginRoute(pathname)) {
      return redirectTo(request, "/dashboard");
    }
    return redirectTo(request, "/dashboard");
  }

  if (isAdminAppRoute(pathname)) {
    if (!userId) {
      return redirectTo(request, "/admin/login", nextPath);
    }
    if (!staff) {
      return redirectTo(request, "/dashboard");
    }
    return response;
  }

  if (isLearnerAppRoute(pathname)) {
    if (!userId) {
      return redirectTo(request, "/login", nextPath);
    }
    if (staff) {
      return redirectTo(request, "/admin/dashboard");
    }
    return response;
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = await updateSession(request);

  if (!isSupabaseConfigured()) {
    const demoUser = getDemoUserFromRequest(request);
    return gateRequest(
      request,
      response,
      demoUser?.id ?? null,
      demoUser?.role ?? null,
    );
  }

  const { userId, role } = await getUserRole(request, response);
  return gateRequest(request, response, userId, role);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
