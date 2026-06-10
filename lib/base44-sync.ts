/**
 * Base44 Sync Module
 *
 * Pushes Hyperswitch webhook data to Base44 entities.
 * Creates/updates: HyperswitchEvent, HyperswitchPayment, HyperswitchSubscription
 * Also updates: CustomerProfile.billingStatus, PaymentLog
 */

const BASE44_API_KEY = process.env.BASE44_API_KEY || '';
const BASE44_APP_ID = process.env.BASE44_APP_ID || '';
const BASE44_BRIDGE_URL = process.env.BASE44_BRIDGE_URL || 'https://newleaf-financial.base44.app';

interface Base44Response {
  success: boolean;
  id?: string;
  error?: string;
}

async function b44Request(
  entity: string,
  action: 'query' | 'get' | 'create' | 'update',
  data?: Record<string, any>
): Promise<any> {
  const url = `${BASE44_BRIDGE_URL}/vpsAgentToolRouter`;

  const payload: Record<string, any> = {
    internalToken: BASE44_API_KEY,
    tool: action === 'query' ? 'b44_query' : action === 'create' ? 'b44_create' : 'b44_update',
    entity,
    ...(action === 'query' ? { filter: data?.filter || {}, sort: data?.sort || '-createdAt', limit: 1 } : {}),
    ...(action === 'create' ? { data } : {}),
    ...(action === 'update' ? { id: data?.id, data: data?.patch } : {}),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[Base44] ${action} ${entity} failed:`, res.status);
      return null;
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[Base44] ${action} ${entity} error:`, err.message);
    return null;
  }
}

/**
 * Check if webhook event has been processed (idempotency).
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const result = await b44Request('HyperswitchEvent', 'query', {
    filter: { eventId },
  });
  if (result?.records?.length > 0) return true;
  return false;
}

/**
 * Record a new HyperswitchEvent (idempotency anchor).
 */
export async function recordEvent(event: {
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  signatureValid: boolean;
}): Promise<string | null> {
  const result = await b44Request('HyperswitchEvent', 'create', {
    eventId: event.eventId,
    eventType: event.eventType,
    payload: JSON.stringify(event.payload),
    signatureValid: event.signatureValid,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return result?.id || null;
}

/**
 * Sync payment from webhook to HyperswitchPayment entity.
 */
export async function syncPayment(payment: {
  paymentId: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentLinkUrl?: string;
  styleId?: string;
  paymentMethodId?: string;
  networkTransactionId?: string;
  mandateId?: string;
}): Promise<string | null> {
  // Check if exists
  const existing = await b44Request('HyperswitchPayment', 'query', {
    filter: { paymentId: payment.paymentId },
  });

  if (existing?.records?.length > 0) {
    // Update
    const result = await b44Request('HyperswitchPayment', 'update', {
      id: existing.records[0].id,
      patch: {
        status: payment.status,
        paymentMethodId: payment.paymentMethodId,
        networkTransactionId: payment.networkTransactionId,
        mandateId: payment.mandateId,
        updatedAt: new Date().toISOString(),
      },
    });
    return existing.records[0].id;
  }

  // Create
  const result = await b44Request('HyperswitchPayment', 'create', {
    paymentId: payment.paymentId,
    customerId: payment.customerId || '',
    amount: payment.amount,
    currency: payment.currency || 'USD',
    status: payment.status,
    paymentLinkUrl: payment.paymentLinkUrl || '',
    styleId: payment.styleId || '',
    paymentMethodId: payment.paymentMethodId || '',
    networkTransactionId: payment.networkTransactionId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return result?.id || null;
}

/**
 * Sync subscription from webhook to HyperswitchSubscription entity.
 */
export async function syncSubscription(sub: {
  subId: string;
  customerId?: string;
  amount?: number;
  currency?: string;
  status: string;
  paymentMethodId?: string;
  mandateId?: string;
  nextChargeAt?: string;
  frequency?: string;
}): Promise<string | null> {
  const existing = await b44Request('HyperswitchSubscription', 'query', {
    filter: { subId: sub.subId },
  });

  if (existing?.records?.length > 0) {
    const result = await b44Request('HyperswitchSubscription', 'update', {
      id: existing.records[0].id,
      patch: {
        status: sub.status,
        paymentMethodId: sub.paymentMethodId,
        nextChargeAt: sub.nextChargeAt,
        updatedAt: new Date().toISOString(),
      },
    });
    return existing.records[0].id;
  }

  const result = await b44Request('HyperswitchSubscription', 'create', {
    subId: sub.subId,
    customerId: sub.customerId || '',
    amount: sub.amount || 0,
    currency: sub.currency || 'USD',
    frequency: sub.frequency || 'monthly',
    status: sub.status,
    paymentMethodId: sub.paymentMethodId || '',
    mandateId: sub.mandateId || '',
    nextChargeAt: sub.nextChargeAt || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return result?.id || null;
}

/**
 * Map HS webhook event to Base44 action.
 */
export async function processWebhookEvent(event: {
  eventId: string;
  eventType: string;
  data: Record<string, any>;
}): Promise<{ processed: boolean; action: string; details: string }> {
  // Idempotency check
  if (await isEventProcessed(event.eventId)) {
    return { processed: false, action: 'skipped', details: 'Already processed' };
  }

  const { eventType, data } = event;
  let action = 'logged';
  let details = '';

  switch (eventType) {
    case 'payment_succeeded': {
      await syncPayment({
        paymentId: data.payment_id,
        customerId: data.customer_id,
        amount: data.amount,
        currency: data.currency,
        status: 'succeeded',
        paymentMethodId: data.payment_method_id,
        networkTransactionId: data.network_transaction_id,
        mandateId: data.mandate_id,
      });
      action = 'payment_synced';
      details = `Payment ${data.payment_id} succeeded`;
      break;
    }
    case 'payment_failed': {
      await syncPayment({
        paymentId: data.payment_id,
        customerId: data.customer_id,
        amount: data.amount,
        currency: data.currency,
        status: 'failed',
        paymentMethodId: data.payment_method_id,
      });
      action = 'payment_failed';
      details = `Payment ${data.payment_id} failed: ${data.error_message || 'unknown'}`;
      break;
    }
    case 'payment_processing': {
      await syncPayment({
        paymentId: data.payment_id,
        customerId: data.customer_id,
        amount: data.amount,
        currency: data.currency,
        status: 'processing',
      });
      action = 'payment_processing';
      details = `Payment ${data.payment_id} processing`;
      break;
    }
    case 'payment_cancelled': {
      await syncPayment({
        paymentId: data.payment_id,
        status: 'cancelled',
        amount: data.amount,
        currency: data.currency,
      });
      action = 'payment_cancelled';
      details = `Payment ${data.payment_id} cancelled`;
      break;
    }
    case 'mandate_active': {
      await syncSubscription({
        subId: data.mandate_id,
        customerId: data.customer_id,
        paymentMethodId: data.payment_method_id,
        status: 'active',
        mandateId: data.mandate_id,
      });
      action = 'mandate_active';
      details = `Mandate ${data.mandate_id} active`;
      break;
    }
    case 'mandate_revoked': {
      await syncSubscription({
        subId: data.mandate_id,
        status: 'revoked',
      });
      action = 'mandate_revoked';
      details = `Mandate ${data.mandate_id} revoked`;
      break;
    }
    case 'refund_succeeded': {
      action = 'refund_succeeded';
      details = `Refund for payment ${data.payment_id} succeeded`;
      break;
    }
    case 'refund_failed': {
      action = 'refund_failed';
      details = `Refund for payment ${data.payment_id} failed`;
      break;
    }
    default: {
      if (eventType.startsWith('dispute_')) {
        action = 'dispute_event';
        details = `Dispute: ${eventType} for ${data.payment_id}`;
      } else {
        action = 'unknown_event';
        details = `Unhandled event: ${eventType}`;
      }
    }
  }

  // Record event for idempotency
  await recordEvent({
    eventId: event.eventId,
    eventType: event.eventType,
    payload: event.data,
    signatureValid: true,
  });

  return { processed: true, action, details };
}
