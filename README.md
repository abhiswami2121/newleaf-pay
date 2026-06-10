# newleaf-pay — Unified Vercel Payment Platform

**pay.newleaf.financial** — ONE Vercel project hosting the complete NewLeaf payment surface: hosted payment links, admin control panel, customer billing portal, agent payment API, and Hyperswitch webhook receiver.

## Architecture

```
Agents → pay.newleaf.financial (Vercel)
           ├─ /pay/[id]            → HyperLoader SDK (PCI-compliant hosted payment)
           ├─ /api/payments/*      → Agent API (Bearer auth)
           ├─ /api/control/*       → Admin API (Clerk + admin role)
           ├─ /api/webhook/hyperswitch → Webhook receiver (HMAC-SHA512)
           ├─ /portal/*             → Customer billing portal (Clerk auth)
           └─ /admin/*              → Admin control panel (Clerk + admin role)
                    ↓
           Hyperswitch @ 187.127.250.171:8080 (VPS)
                    ↓
           NMI Connector → Allied Payments
                    ↓
           Webhooks → Vercel → Base44 Entity Sync
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui + glassmorphism
- **Auth:** Clerk (user sessions + admin role via publicMetadata)
- **Payments:** Hyperswitch self-hosted on VPS :8080
- **Database:** Base44 entities (HyperswitchEvent, HyperswitchPayment, HyperswitchSubscription)
- **Deploy:** Vercel (production)

## Design System

- **Palette:** Dark-only emerald (#10B981 Hermès cyan)
- **Background:** `#0a0f0c` (deep emerald-black)
- **Cards:** `rgba(255,255,255,0.03)` glass panels
- **Borders:** `rgba(16,185,129,0.12)` emerald hairline
- **Accent:** `#10B981` across all UI

## Quick Start

```bash
# Install
cd newleaf-pay && npm install

# Configure environment
cp .env.example .env.local
# Fill in: HYPERSWITCH_API_KEY, CLERK_SECRET_KEY, AGENT_SECRET_KEY, etc.

# Develop
npm run dev
# → http://localhost:3000
```

## Environment Variables (14 required)

| Variable | Purpose |
|---|---|
| `HYPERSWITCH_API_KEY` | HS Admin API key (api-key header auth) |
| `HYPERSWITCH_VPS_URL` | `http://187.127.250.171:8080` |
| `HYPERSWITCH_WEBHOOK_SECRET` | HMAC-SHA512 shared secret |
| `NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY` | HyperLoader SDK client key |
| `NEXT_PUBLIC_APP_URL` | `https://pay.newleaf.financial` |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SIGN_IN_URL` | `/sign-in` |
| `CLERK_SIGN_UP_URL` | `/sign-up` |
| `AGENT_SECRET_KEY` | Bearer token for agent API auth |
| `BASE44_API_URL` | Base44 vpsAgentToolRouter URL |
| `BASE44_DIAG_KEY` | Base44 internal auth token |
| `NMI_SECURITY_KEY` | NMI API key (VPS ONLY — NEVER in Vercel env) |

## Agent API Endpoints

All agent endpoints use `Authorization: Bearer nl_agent_sk_2026_hs1_unified_pay_platform_v1`.

| Endpoint | Purpose |
|---|---|
| `POST /api/payments/create-link` | Create hosted payment link |
| `POST /api/payments/create-subscription` | Create subscription with mandate |
| `POST /api/payments/charge` | MIT off-session charge |
| `POST /api/payments/refund` | Full or partial refund |
| `POST /api/payments/cancel-subscription` | Cancel subscription |
| `GET /api/payments/status/[paymentId]` | Get payment status |

## Agent Usage Examples

```bash
# Create a recovery payment link
curl -X POST https://pay.newleaf.financial/api/payments/create-link \
  -H "Authorization: Bearer nl_agent_sk_2026_hs1_unified_pay_platform_v1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "USD",
    "customerId": "cust_001",
    "productName": "Debt Resolution Payment",
    "styleId": "newleaf-recovery"
  }'

# Create a subscription
curl -X POST https://pay.newleaf.financial/api/payments/create-subscription \
  -H "Authorization: Bearer nl_agent_sk_2026_hs1_unified_pay_platform_v1" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_001",
    "amount": 19900,
    "currency": "USD",
    "frequency": "monthly",
    "customerIp": "203.0.113.42",
    "userAgent": "Mozilla/5.0 ...",
    "styleId": "newleaf-sub-signup"
  }'

# MIT charge
curl -X POST https://pay.newleaf.financial/api/payments/charge \
  -H "Authorization: Bearer nl_agent_sk_2026_hs1_unified_pay_platform_v1" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_001",
    "paymentMethodId": "pm_abc123",
    "amount": 19900,
    "currency": "USD",
    "initialTransactionId": "pay_day0_cit_xyz",
    "billingId": "bill_june_2026"
  }'
```

## Cardinal Rules (NON-NEGOTIABLE)

1. **api-key header** — HS auth uses `api-key` (NOT X-Api-Key)
2. **payment_link_config_id** — TOP-LEVEL in POST /payments (not nested)
3. **initial_transaction_id** — MIT charges use this (NOT source_transaction_id)
4. **stored_credential_indicator: 'used'** — NOT 'stored'
5. **Real customer IP** — customer_acceptance needs actual IP from request
6. **branding_visibility: false** — All payment pages white-label
7. **NMI security key** — NEVER in Vercel env (VPS only)
8. **Velocity guard** — 3+ MIT failures in 24h → BLOCK → SMS recovery link
9. **Webhook idempotency** — HyperswitchEvent.eventId UNIQUE constraint

## Styles (pre-designed)

| Style ID | Use Case |
|---|---|
| `newleaf-one-time` | Day 0 CIT enrollment |
| `newleaf-recovery` | Soft/hard decline recovery |
| `newleaf-sub-signup` | Subscription with mandate |
| `newleaf-upgrade` | Plan upgrade |
| `newleaf-resume` | Resume paused plan |

## Project Structure

```
newleaf-pay/
├── app/
│   ├── (authed)/
│   │   ├── admin/           # Admin control panel
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── payment-links/   # Link management
│   │   │   ├── control-panel/   # Style/connector config
│   │   │   ├── products/        # Product catalog
│   │   │   ├── subscriptions/   # Subscription list
│   │   │   ├── customers/       # Customer list
│   │   │   ├── transactions/    # Transaction history
│   │   │   └── webhooks/        # Webhook event log
│   │   └── portal/          # Customer billing portal
│   │       ├── page.tsx         # Dashboard
│   │       ├── payment-methods/ # Card management
│   │       ├── subscriptions/   # My subscriptions
│   │       └── history/         # Payment history
│   ├── (public)/
│   │   └── pay/[paymentId]/ # Hosted payment page (HyperLoader)
│   ├── api/
│   │   ├── payments/        # Agent API
│   │   │   ├── create-link/
│   │   │   ├── create-subscription/
│   │   │   ├── charge/
│   │   │   ├── refund/
│   │   │   ├── cancel-subscription/
│   │   │   └── status/[paymentId]/
│   │   ├── control/         # Admin API
│   │   │   ├── style-ids/
│   │   │   ├── connectors/
│   │   │   └── merchants/
│   │   └── webhook/
│   │       └── hyperswitch/ # Webhook receiver
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   └── globals.css
├── lib/
│   ├── hyperswitch.ts       # HS client (cardinal rules encoded)
│   ├── auth.ts              # Dual auth (Clerk + Agent key)
│   └── base44-sync.ts       # Webhook → Base44 entity sync
├── middleware.ts             # Clerk route protection
├── .env.local               # Dev environment (14 vars)
└── package.json
```

## Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Live at: **https://pay.newleaf.financial**

---

**HS-1 Mission · 8 Phases · 250 Turns · June 2026**
Built by Jarvis with Claude Opus 4.7
