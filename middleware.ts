/**
 * newleaf-pay Middleware
 *
 * Route protection with dual auth:
 * - /api/payments/* → Agent API key (Bearer token)
 * - /api/control/* → Clerk session + admin role
 * - /api/webhook/hyperswitch → HMAC-SHA512 (handled in route, not middleware)
 * - /admin/* → Clerk session + admin role
 * - /portal/* → Clerk session (any user)
 * - /pay/[id] → Public (HyperLoader loads client_secret)
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes — no auth needed
const isPublicRoute = createRouteMatcher([
  '/',
  '/pay/:path*',
  '/api/webhook/hyperswitch',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Agent API routes — require Bearer token (checked in route handlers)
const isAgentApiRoute = createRouteMatcher([
  '/api/payments/:path*',
]);

// Admin routes — require Clerk session
const isAdminRoute = createRouteMatcher([
  '/admin/:path*',
  '/api/control/:path*',
]);

// Portal routes — require Clerk session
const isPortalRoute = createRouteMatcher([
  '/portal/:path*',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip public + agent routes (agent auth handled in route handlers)
  if (isPublicRoute(req) || isAgentApiRoute(req)) {
    return;
  }

  // Protect admin + portal routes with Clerk
  if (isAdminRoute(req) || isPortalRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
