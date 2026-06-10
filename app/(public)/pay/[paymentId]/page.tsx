/**
 * /pay/[paymentId] — Hosted Payment Link Page
 *
 * Public route that loads the Hyperswitch HyperLoader SDK
 * for the given payment. Client-side only.
 *
 * Uses HS publishable key + client_secret to render the payment form.
 */

"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import Script from "next/script";
import Link from "next/link";

const HS_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY || "pk_snd_5a9ae8da75624e19b0b7608205aebf8b";
const HS_SDK_URL = "https://js.hyperswitch.io/v1/HyperLoader.js";

export default function PaymentLinkPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [hsLoaded, setHsLoaded] = useState(false);

  // Fetch client_secret from Hyperswitch
  useEffect(() => {
    async function fetchSecret() {
      try {
        // Try to get client secret via agent endpoint (local proxy)
        const res = await fetch(`/api/payments/status/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AGENT_SECRET_KEY || ""}`,
          },
        });

        if (!res.ok) {
          // Fallback: try to construct secret from payment ID
          setClientSecret(`${paymentId}_secret`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          // Construct from payment ID
          setClientSecret(`${paymentId}_secret`);
        }
      } catch {
        setClientSecret(`${paymentId}_secret`);
      } finally {
        setLoading(false);
      }
    }

    fetchSecret();
  }, [paymentId]);

  // Initialize HyperLoader
  useEffect(() => {
    if (!hsLoaded || !clientSecret) return;

    try {
      const hyper = (window as any).HyperSwitch;
      if (!hyper) return;

      hyper.loader("hyper-loader-container", {
        publishableKey: HS_PUBLISHABLE_KEY,
        clientSecret,
        appearance: {
          theme: "dark",
          variables: {
            colorPrimary: "#10B981",
            colorBackground: "#0A0A0F",
            colorText: "rgba(255,255,255,0.92)",
            colorDanger: "#EF4444",
            borderRadius: "0.75rem",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
          },
        },
        options: {
          business: { name: "NewLeaf Financial" },
          layout: "tabs",
        },
      });

      // Listen for payment completion
      hyper.on("payment_successful", (event: any) => {
        router.push(`/portal?status=success&payment=${paymentId}`);
      });

      hyper.on("payment_failed", (event: any) => {
        setError(event?.error?.message || "Payment failed. Please try again.");
      });
    } catch (err: any) {
      console.error("HyperLoader init error:", err);
      setError("Failed to initialize payment form.");
    }
  }, [hsLoaded, clientSecret, paymentId, router]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Leaf className="w-12 h-12 text-[var(--emerald)] mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Payment Error</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{error}</p>
          <Link
            href="/"
            className="text-sm text-[var(--emerald)] hover:underline"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={HS_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setHsLoaded(true)}
      />

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="no-underline">
              <span className="inline-flex items-center font-bold tracking-tight text-lg gap-1.5">
                <Leaf className="w-[18px] h-[18px] text-[var(--emerald)]" strokeWidth={2.5} />
                <span className="text-[var(--text-primary)]">
                  New<span className="text-[var(--emerald)]">Leaf</span>
                </span>
              </span>
            </Link>
            <span className="text-xs text-[var(--text-muted)]">Secure Payment</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[var(--emerald)] animate-spin mb-4" />
                <p className="text-sm text-[var(--text-secondary)]">Loading payment form...</p>
              </div>
            )}

            <div
              id="hyper-loader-container"
              className={loading ? "hidden" : "animate-fade-in"}
            />
          </div>
        </main>

        <footer className="border-t border-[var(--border)] py-4">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Powered by <span className="font-medium text-[var(--emerald)]">NewLeaf Financial</span>
              {" "}· Secure payment processing
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
