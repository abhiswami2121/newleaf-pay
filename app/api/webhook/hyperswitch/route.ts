/**
 * POST /api/webhook/hyperswitch
 *
 * Receives Hyperswitch webhook events.
 * Verifies HMAC-SHA512 signature.
 * Syncs to Base44 entities (HyperswitchEvent, HyperswitchPayment, HyperswitchSubscription).
 * Idempotent via HyperswitchEvent.eventId UNIQUE check.
 *
 * Event types handled (17):
 * payment_succeeded, payment_failed, payment_processing, payment_cancelled,
 * payment_authorized, payment_captured, payment_action_required,
 * refund_succeeded, refund_failed, 7 dispute events,
 * mandate_active, mandate_revoked
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/auth";
import { processWebhookEvent } from "@/lib/base44-sync";

export async function POST(request: NextRequest) {
  // 1. Read raw body for HMAC verification
  const rawBody = await request.text();
  let payload: Record<string, any>;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2. Verify HMAC-SHA512 signature
  const webhookReq = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: rawBody,
  });

  const sigResult = await verifyWebhookSignature(webhookReq, rawBody);
  if (!sigResult.authenticated) {
    console.error("[webhook] Signature verification failed:", sigResult.error);
    return NextResponse.json(
      { error: "Invalid signature", details: sigResult.error },
      { status: 401 }
    );
  }

  // 3. Extract event details
  const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
  const eventType = payload.event_type || payload.type || "unknown";
  const data = payload.data || payload.content || payload;

  console.log(`[webhook] Received: ${eventType} (${eventId})`);

  // 4. Process webhook event (idempotent via Base44 entity check)
  try {
    const result = await processWebhookEvent({
      eventId,
      eventType,
      data,
    });

    return NextResponse.json({
      received: true,
      processed: result.processed,
      action: result.action,
      details: result.details,
    });
  } catch (err: any) {
    console.error("[webhook] Processing error:", err.message);
    // Always return 200 to HS to prevent retry storms
    return NextResponse.json({
      received: true,
      processed: false,
      error: err.message,
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
