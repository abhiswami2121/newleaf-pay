/**
 * GET /api/control/connectors
 * Admin endpoint — returns Hyperswitch connector status.
 * Requires Clerk auth + admin role.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { healthCheck, hyperswitchRequest } from "@/lib/hyperswitch";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Check HS health
  const health = await healthCheck();

  return NextResponse.json({
    health,
    connectors: [
      {
        id: "mca_PW7l917OgYxqa0MvXU1g",
        type: "nmi",
        status: health.healthy ? "active" : "unknown",
        merchant_id: process.env.HYPERSWITCH_MERCHANT_ID || "newleaf_test_001",
        profile_id: process.env.HYPERSWITCH_PROFILE_ID || "pro_FcTsudWLf271LHfKBBnG",
      },
    ],
    environment: "sandbox",
    base_url: process.env.HYPERSWITCH_VPS_URL || "http://localhost:8080",
  });
}
