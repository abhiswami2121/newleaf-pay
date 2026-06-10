/**
 * GET /api/payments/status/[paymentId]
 *
 * Get full payment status from Hyperswitch.
 * Agent auth: Bearer token required.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAgentAuth } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/hyperswitch";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const auth = verifyAgentAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { paymentId } = await params;

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required in URL" }, { status: 400 });
  }

  const result = await getPaymentStatus(paymentId);

  if (result.error) {
    console.error("[status] HS error:", result.error);
    return NextResponse.json(
      { error: result.error.message, code: result.error.code },
      { status: 502 }
    );
  }

  return NextResponse.json({
    paymentId: result.payment_id,
    status: result.status,
    amount: result.amount,
    currency: result.currency,
    customerId: result.customer_id,
    paymentMethodId: result.payment_method_id,
    mandateId: result.mandate_id,
    networkTransactionId: result.network_transaction_id,
    created: result.created,
    errorCode: result.error_code || null,
    errorMessage: result.error_message || null,
    refunds: result.refunds || [],
    disputes: result.disputes || [],
  });
}
