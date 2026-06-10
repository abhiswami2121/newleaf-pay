/**
 * POST /api/payments/create-subscription
 *
 * Create a subscription with mandate via Hyperswitch.
 * Agent auth: Bearer token required.
 *
 * Body: { customerId, amount, currency?, frequency?, customerIp, userAgent, paymentMethodId?, styleId? }
 * Returns: { subId, paymentId, clientSecret, mandateId, checkoutUrl }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { createSubscription, getClientIp } from "@/lib/hyperswitch";

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

  const {
    customerId,
    amount,
    currency,
    frequency,
    customerIp,
    userAgent,
    paymentMethodId,
    styleId,
  } = body;

  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }

  // CARDINAL: Use REAL IP from request context
  const realIp = customerIp || getClientIp(request);
  const realUA = userAgent || request.headers.get("user-agent") || "Unknown";

  if (realIp === "127.0.0.1" || realIp === "0.0.0.0" || realIp === "::1") {
    return NextResponse.json(
      { error: "Invalid customer IP — must provide real IP in customerIp field or x-forwarded-for header" },
      { status: 400 }
    );
  }

  const result = await createSubscription({
    customerId,
    amount,
    currency: currency || "USD",
    frequency: frequency || "monthly",
    customerIp: realIp,
    userAgent: realUA,
    paymentMethodId,
    styleId: styleId || "newleaf-sub-signup",
  });

  if (result.error) {
    console.error("[create-subscription] HS error:", result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pay.newleaf.financial";
  const checkoutUrl = `${baseUrl}/pay/${result.payment_id}`;

  return NextResponse.json({
    subId: result.payment_id, // HS uses payment_id as initial sub reference
    paymentId: result.payment_id,
    clientSecret: result.client_secret,
    mandateId: result.mandate_id || null,
    checkoutUrl,
    status: result.status,
    amount: result.amount,
    currency: result.currency,
  });
}
