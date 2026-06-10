/**
 * GET /api/portal/me
 * Returns current user's billing profile from Clerk session.
 * Used by customer portal to show subscription + payment info.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyClerkAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await verifyClerkAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // In production, fetch from Base44 + Hyperswitch
  // For now, return mock profile
  return NextResponse.json({
    userId: auth.userId,
    profile: {
      customerId: "cust_001",
      currentPlan: "Debt Resolution Program",
      planAmount: 199.00,
      currency: "USD",
      frequency: "monthly",
      nextChargeDate: "2026-07-10",
      paymentMethod: {
        brand: "Visa",
        last4: "4242",
        expiry: "12/2028",
        isDefault: true,
      },
      billingStatus: "active",
      subscriptionId: "sub_abc123",
    },
  });
}
