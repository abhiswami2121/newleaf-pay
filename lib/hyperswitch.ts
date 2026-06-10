/**
 * Hyperswitch Centralized Client
 *
 * ALL Hyperswitch API calls go through this module.
 * Cardinal rules encoded:
 * - Header is 'api-key' NOT 'X-Api-Key' (per memory 6a1cda58)
 * - payment_link_config_id is TOP-LEVEL in POST /payments
 * - MIT uses initial_transaction_id NOT source_transaction_id
 * - MIT stored_credential_indicator: 'used' NOT 'stored'
 * - white-label always branding_visibility: false
 */

const HS_BASE = process.env.HYPERSWITCH_VPS_URL || 'http://localhost:8080';
const HS_API_KEY = process.env.HYPERSWITCH_API_KEY || '';
const HS_PROFILE_ID = process.env.HYPERSWITCH_PROFILE_ID || '';

export interface HyperswitchPaymentRequest {
  amount: number;
  currency: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  customerIp?: string;
  userAgent?: string;
  productName?: string;
  description?: string;
  styleId?: string;
  // For payment links
  paymentLink?: boolean;
  paymentLinkConfigId?: string;
  // For subscriptions / MIT
  setupFutureUsage?: 'off_session';
  offSession?: boolean;
  // For MIT
  initialTransactionId?: string;
  recurringDetails?: {
    type: 'payment_method_id';
    data: string;
  };
  // Mandate
  mandateData?: {
    customer_acceptance: {
      acceptance_type: 'online';
      online: {
        ip_address: string;
        user_agent: string;
      };
    };
    mandate_type: {
      multi_use?: {
        mandate_metadata?: {
          amount?: number;
          currency?: string;
          start_date?: string;
          end_date?: string;
        };
      };
    };
  };
}

export interface HyperswitchResponse {
  payment_id?: string;
  client_secret?: string;
  status?: string;
  amount?: number;
  currency?: string;
  error?: { message: string; code: string };
  [key: string]: any;
}

/**
 * Core request function — all HS calls route through here.
 * Uses 'api-key' header per cardinal rule #4.
 */
export async function hyperswitchRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, any>,
  options?: { timeout?: number }
): Promise<HyperswitchResponse> {
  const url = `${HS_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeout || 30000);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api-key': HS_API_KEY,  // CARDINAL: api-key NOT X-Api-Key
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();

    if (!res.ok) {
      console.error('[HS] Error', res.status, data);
      return {
        error: {
          message: data?.error?.message || `HS returned ${res.status}`,
          code: data?.error?.code || `HS_${res.status}`,
        },
        ...data,
      };
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeout);
    console.error('[HS] Request failed:', err.message);
    return { error: { message: err.message, code: 'HS_REQUEST_FAILED' } };
  }
}

/**
 * Get real client IP from request headers.
 * CARDINAL: Never use 127.0.0.1 for customer_acceptance.online.ip_address
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '0.0.0.0'; // will be rejected by HS — forces caller to provide real IP
}

/**
 * Build customer_acceptance block with REAL IP from request context.
 */
export function buildCustomerAcceptance(request: Request, userAgent?: string) {
  return {
    acceptance_type: 'online' as const,
    online: {
      ip_address: getClientIp(request),
      user_agent: userAgent || request.headers.get('user-agent') || 'Unknown',
    },
  };
}

/**
 * Create a payment (with optional payment link).
 */
export async function createPayment(params: HyperswitchPaymentRequest) {
  const body: Record<string, any> = {
    amount: params.amount,
    currency: params.currency || 'USD',
    profile_id: HS_PROFILE_ID,
    // White-label — never show "Powered by Hyperswitch"
    payment_link_config: params.paymentLink ? {
      branding_visibility: false,
      theme: '#10B981',
      seller_name: 'NewLeaf Financial',
      ...(params.styleId ? { id: params.styleId } : {}),
    } : undefined,
  };

  // payment_link_config_id is TOP-LEVEL per cardinal rule #5
  if (params.paymentLinkConfigId) {
    body.payment_link_config_id = params.paymentLinkConfigId;
  }

  if (params.paymentLink) {
    body.payment_link = true;
    body.return_url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pay.newleaf.financial'}/portal?status=success`;
  }

  if (params.customerId) {
    body.customer_id = params.customerId;
  }

  if (params.setupFutureUsage) {
    body.setup_future_usage = params.setupFutureUsage;
    if (params.mandateData) {
      body.mandate_data = params.mandateData;
    }
  }

  if (params.description) body.description = params.description;
  if (params.orderId) body.order_id = params.orderId;

  return hyperswitchRequest('/payments', 'POST', body);
}

/**
 * Create a MIT (Merchant Initiated Transaction) charge.
 * CARDINAL: uses initial_transaction_id NOT source_transaction_id
 * CARDINAL: stored_credential_indicator: 'used' NOT 'stored'
 */
export async function createMitCharge(params: {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
  initialTransactionId: string;
  billingId?: string;
}) {
  return hyperswitchRequest('/payments', 'POST', {
    amount: params.amount,
    currency: params.currency || 'USD',
    profile_id: HS_PROFILE_ID,
    customer_id: params.customerId,
    off_session: true,
    payment_method_id: params.paymentMethodId,
    // CARDINAL: initial_transaction_id not source_transaction_id
    recurring_details: {
      type: 'payment_method_id',
      data: params.paymentMethodId,
    },
    // CARDINAL: stored_credential_indicator = 'used'
    mandate_data: {
      mandate_type: {
        multi_use: {
          mandate_metadata: {
            amount: params.amount,
            currency: params.currency || 'USD',
          },
        },
      },
    },
    metadata: {
      initial_transaction_id: params.initialTransactionId,
      stored_credential_indicator: 'used',
      billing_id: params.billingId || '',
    },
  });
}

/**
 * Create a subscription with mandate.
 */
export async function createSubscription(params: {
  customerId: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  customerIp: string;
  userAgent: string;
  paymentMethodId?: string;
  styleId?: string;
}) {
  const body: Record<string, any> = {
    amount: params.amount,
    currency: params.currency || 'USD',
    profile_id: HS_PROFILE_ID,
    customer_id: params.customerId,
    setup_future_usage: 'off_session',
    payment_link: true,
    payment_link_config: {
      branding_visibility: false,
      theme: '#10B981',
      seller_name: 'NewLeaf Financial',
      ...(params.styleId ? { id: params.styleId } : { id: 'newleaf-sub-signup' }),
    },
    mandate_data: {
      customer_acceptance: {
        acceptance_type: 'online',
        online: {
          ip_address: params.customerIp,
          user_agent: params.userAgent,
        },
      },
      mandate_type: {
        multi_use: {
          mandate_metadata: {
            amount: params.amount,
            currency: params.currency || 'USD',
          },
        },
      },
    },
  };

  if (params.paymentMethodId) {
    body.payment_method_id = params.paymentMethodId;
  }

  return hyperswitchRequest('/payments', 'POST', body);
}

/**
 * Refund a payment.
 */
export async function refundPayment(paymentId: string, amount?: number) {
  const body: Record<string, any> = {
    payment_id: paymentId,
    profile_id: HS_PROFILE_ID,
  };
  if (amount) body.amount = amount;
  return hyperswitchRequest('/refunds', 'POST', body);
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(subscriptionId: string, immediate?: boolean) {
  return hyperswitchRequest(`/subscriptions/${subscriptionId}/cancel`, 'POST', {
    profile_id: HS_PROFILE_ID,
    ...(immediate !== undefined ? { immediate } : {}),
  });
}

/**
 * Get payment status.
 */
export async function getPaymentStatus(paymentId: string) {
  return hyperswitchRequest(`/payments/${paymentId}`, 'GET');
}

/**
 * Health check.
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${HS_BASE}/health`);
    return { healthy: res.ok, text: await res.text() };
  } catch {
    return { healthy: false, text: 'unreachable' };
  }
}
