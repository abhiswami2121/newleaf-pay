/**
 * POST /api/payments/create-link
 *
 * Create a hosted payment link via Hyperswitch.
 * Agent auth: Bearer token required.
 *
 * Body: { amount, currency?, customerId?, productName?, styleId?, description? }
 * Returns: { paymentId, clientSecret, checkoutUrl }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { createPayment } from "@/lib/hyperswitch";

export async function POST(request: NextRequest) {
  // 1. Agent auth
  const auth = verifyAgentAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // 2. Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, currency, customerId, productName, styleId, description, orderId } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }

  // 3. Velocity guard (basic — enhance with Redis/DB later)
  // TODO: track failure count per vault

  // 4. Create payment link via Hyperswitch
  const result = await createPayment({
    amount,
    currency: currency || "USD",
    customerId,
    productName,
    styleId: styleId || "newleaf-one-time",
    description: description || productName || "Payment",
    orderId,
    paymentLink: true,
  });

  if (result.error) {
    console.error("[create-link] HS error:", result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 }
    );
  }

  // 5. Build checkout URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pay.newleaf.financial";
  const checkoutUrl = `${baseUrl}/pay/${result.payment_id}`;

  return NextResponse.json({
    paymentId: result.payment_id,
    clientSecret: result.client_secret,
    checkoutUrl,
    status: result.status,
    amount: result.amount,
    currency: result.currency,
  });
}
