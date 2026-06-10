/**
 * Dual Auth Module
 *
 * Two authentication paths:
 * 1. Clerk session — for browser users (/admin/*, /portal/*)
 * 2. Agent API key — for programmatic agent access (/api/payments/*, /api/control/*)
 */

import { auth } from '@clerk/nextjs/server';

const AGENT_SECRET_KEY = process.env.AGENT_SECRET_KEY || '';

export type AuthResult = {
  authenticated: boolean;
  type: 'user' | 'agent' | 'webhook' | 'none';
  userId?: string;
  metadata?: Record<string, any>;
  error?: string;
};

/**
 * Authenticate agent API key from Bearer token.
 */
export function verifyAgentAuth(request: Request): AuthResult {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, type: 'none', error: 'Missing Bearer token' };
  }

  const token = authHeader.slice(7);
  if (token !== AGENT_SECRET_KEY) {
    return { authenticated: false, type: 'none', error: 'Invalid agent API key' };
  }

  return {
    authenticated: true,
    type: 'agent',
    metadata: { source: 'agent-api' },
  };
}

/**
 * Authenticate Clerk user session (for server components / route handlers).
 */
export async function verifyClerkAuth(): Promise<AuthResult> {
  try {
    const session = await auth();
    if (!session.userId) {
      return { authenticated: false, type: 'none', error: 'No Clerk session' };
    }
    return {
      authenticated: true,
      type: 'user',
      userId: session.userId,
    };
  } catch (err: any) {
    return { authenticated: false, type: 'none', error: err.message };
  }
}

/**
 * Check if user has admin role (via Clerk public metadata).
 */
export async function verifyAdminAuth(): Promise<AuthResult> {
  const result = await verifyClerkAuth();
  if (!result.authenticated) return result;

  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(result.userId!);
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== 'admin') {
      return { authenticated: false, type: 'none', error: 'Admin role required' };
    }

    return { ...result, metadata: { ...result.metadata, role: 'admin' } };
  } catch {
    // Default: allow if they have a Clerk session (admin check via metadata, fallback open)
    // TODO: tighten after initial admin user is set
    return result;
  }
}

/**
 * Verify HMAC-SHA512 webhook signature from Hyperswitch.
 */
export async function verifyWebhookSignature(
  request: Request,
  rawBody: string
): Promise<AuthResult> {
  const signature = request.headers.get('x-hyperswitch-signature');
  if (!signature) {
    return { authenticated: false, type: 'none', error: 'Missing webhook signature' };
  }

  const secret = process.env.HYPERSWITCH_WEBHOOK_SECRET || '';
  if (!secret) {
    return { authenticated: false, type: 'none', error: 'Webhook secret not configured' };
  }

  // HMAC-SHA512 verification
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToBytes(signature),
    encoder.encode(rawBody)
  );

  if (!isValid) {
    return { authenticated: false, type: 'none', error: 'Invalid webhook signature' };
  }

  return {
    authenticated: true,
    type: 'webhook',
    metadata: { source: 'hyperswitch-webhook' },
  };
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}
