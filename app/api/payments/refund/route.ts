/**
 * POST /api/payments/refund
 *
 * Refund a payment via Hyperswitch.
 * Agent auth: Bearer token required.
 *
 * Body: { paymentId, amount? }
 * Returns: { refundId, status, success }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { refundPayment } from "@/lib/hyperswitch";

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

  const { paymentId, amount } = body;

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }

  const result = await refundPayment(paymentId, amount);

  if (result.error) {
    console.error("[refund] HS error:", result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 }
    );
  }

  return NextResponse.json({
    refundId: result.refund_id || result.payment_id,
    status: result.status || "succeeded",
    success: result.status !== "failed",
  });
}
