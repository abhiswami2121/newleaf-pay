/**
 * POST /api/payments/charge
 *
 * MIT (Merchant Initiated Transaction) off_session charge.
 * Agent auth: Bearer token required.
 *
 * CARDINAL RULES:
 * - initial_transaction_id NOT source_transaction_id
 * - stored_credential_indicator: 'used' NOT 'stored'
 *
 * Body: { customerId, paymentMethodId, amount, currency?, initialTransactionId, billingId? }
 * Returns: { transactionId, status, success, responseCode, responseText }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { createMitCharge } from "@/lib/hyperswitch";

// Simple in-memory velocity guard (per vault id)
// Reset on restart; enhance with Redis/DB for production
const vaultFailureCount = new Map<string, { count: number; lastFail: number }>();
const MAX_FAILURES = 3;
const FAIL_WINDOW_MS = 24 * 60 * 60 * 1000;

function checkVelocity(vaultId: string): boolean {
  const entry = vaultFailureCount.get(vaultId);
  if (!entry) return true;
  const elapsed = Date.now() - entry.lastFail;
  if (elapsed > FAIL_WINDOW_MS) {
    vaultFailureCount.delete(vaultId);
    return true;
  }
  return entry.count < MAX_FAILURES;
}

function recordFailure(vaultId: string) {
  const entry = vaultFailureCount.get(vaultId) || { count: 0, lastFail: 0 };
  entry.count++;
  entry.lastFail = Date.now();
  vaultFailureCount.set(vaultId, entry);
}

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
    paymentMethodId,
    amount,
    currency,
    initialTransactionId,
    billingId,
  } = body;

  if (!customerId || !paymentMethodId || !initialTransactionId) {
    return NextResponse.json(
      { error: "customerId, paymentMethodId, and initialTransactionId required" },
      { status: 400 }
    );
  }
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }

  // Velocity guard
  if (!checkVelocity(paymentMethodId)) {
    return NextResponse.json(
      {
        error: "Velocity limit exceeded — 3+ failures in 24h on this vault. Send SMS recovery link instead.",
        code: "VELOCITY_BLOCKED",
        blocked: true,
      },
      { status: 429 }
    );
  }

  // CARDINAL: MIT uses initial_transaction_id NOT source_transaction_id
  const result = await createMitCharge({
    amount,
    currency: currency || "USD",
    customerId,
    paymentMethodId,
    initialTransactionId, // CARDINAL: this is initial_transaction_id
    billingId,
  });

  if (result.error) {
    console.error("[charge] HS error:", result.error);
    recordFailure(paymentMethodId);
    return NextResponse.json(
      {
        error: result.error.message,
        code: result.error.code,
        success: false,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    transactionId: result.payment_id,
    status: result.status,
    success: result.status === "succeeded" || result.status === "processing",
    responseCode: result.connector_response_metadata?.response_code || null,
    responseText: result.connector_response_metadata?.response_text || null,
    amount: result.amount,
    currency: result.currency,
    networkTransactionId: result.network_transaction_id || null,
  });
}
