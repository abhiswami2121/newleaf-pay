/**
 * POST /api/payments/cancel-subscription
 *
 * Cancel a subscription via Hyperswitch.
 * Agent auth: Bearer token required.
 *
 * Body: { subscriptionId, immediate? }
 * Returns: { success, cancelledAt, scheduledCancelDate? }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { cancelSubscription } from "@/lib/hyperswitch";

export async function POST(request: NextRequest) {
  const auth = verifyAgentAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subscriptionId, immediate } = body;

  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
  }

  const result = await cancelSubscription(subscriptionId, immediate);

  if (result.error) {
    console.error("[cancel-subscription] HS error:", result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    cancelledAt: new Date().toISOString(),
    scheduledCancelDate: result.scheduled_cancel_date || null,
    subscriptionId,
  });
}
