import Link from "next/link";
import { Leaf, CreditCard, Zap, Shield, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
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
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex min-h-full flex-col px-4 py-12 md:py-20">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 text-center animate-fade-in">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--emerald-glow)]">
                <Leaf className="w-8 h-8 text-[var(--emerald)]" strokeWidth={2.5} />
              </div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                New<span className="text-[var(--emerald)]">Leaf</span>
              </h1>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                Secure, fast payments for your financial wellness journey
              </p>
            </div>

            <div className="rounded-[var(--radius)] transition-all duration-200 glass-raised shadow-[var(--shadow-sm)] p-6 md:p-8 mb-6 animate-fade-in-scale">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-2">Make a Payment</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Use your payment link or sign in to manage your account, view history, and track your progress.
                </p>
              </div>
              <div className="space-y-3">
                <Link href="/sign-in" className="block">
                  <Button variant="default" size="lg" className="w-full emerald-gradient hover:emerald-gradient-hover hover:shadow-[var(--shadow-emerald)] hover:-translate-y-0.5 btn-press h-14 text-base">
                    Sign In to Pay <ArrowRight className="w-[18px] h-[18px]" />
                  </Button>
                </Link>
                <Link href="/portal" className="block">
                  <Button variant="secondary" size="lg" className="w-full h-14 text-base" style={{ background: "var(--bg-card)" }}>
                    Customer Portal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 mb-8">
              <FeatureCard icon={CreditCard} title="Apple & Google Pay" desc="Pay instantly with your saved cards on any device" />
              <FeatureCard icon={Zap} title="Instant Confirmation" desc="Get real-time payment confirmation and receipts" />
              <FeatureCard icon={Shield} title="Bank-Level Security" desc="PCI DSS Level 1 compliant with 256-bit encryption" />
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[var(--emerald)]" /> PCI Level 1</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[var(--emerald)]" /> 256-bit SSL</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Shield className="w-[14px] h-[14px] text-[var(--emerald)]" /><span>PCI DSS Level 1</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Lock className="w-[14px] h-[14px] text-[var(--emerald)]" /><span>256-bit SSL</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)]">Powered by <span className="font-medium text-[var(--emerald)]">NewLeaf Financial</span></p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">© 2026 NewLeaf Financial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] p-4 glass">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-glow)]">
        <Icon className="w-4 h-4 text-[var(--emerald)]" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
    </div>
  );
}
