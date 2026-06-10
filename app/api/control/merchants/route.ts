/**
 * GET /api/control/merchants
 * Admin endpoint — returns Hyperswitch merchant info.
 * Requires Clerk auth + admin role.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  return NextResponse.json({
    merchants: [
      {
        id: "newleaf_test_001",
        profile_id: "pro_FcTsudWLf271LHfKBBnG",
        publishable_key: "pk_snd_5a9ae8da75624e19b0b7608205aebf8b",
        environment: "sandbox",
        connectors: ["nmi"],
        webhook_url: "https://pay.newleaf.financial/api/webhook/hyperswitch",
      },
    ],
  });
}
