"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Leaf, CreditCard, RefreshCw, History, Settings, LogOut, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortalDashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside className="w-56 border-r border-[var(--border)] glass shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
          <Link href="/" className="no-underline inline-flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-[var(--emerald)]" />
            <span className="text-xs font-bold">NewLeaf <span className="text-[var(--emerald)]">Portal</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink href="/portal" icon={CreditCard} label="Dashboard" active />
          <NavLink href="/portal/payment-methods" icon={CreditCard} label="Payment Methods" />
          <NavLink href="/portal/subscriptions" icon={RefreshCw} label="Subscriptions" />
          <NavLink href="/portal/history" icon={History} label="History" />
        </nav>
        <div className="p-3 border-t border-[var(--border)]">
          <SignOutButton>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/5 w-full transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6 justify-between">
          <h1 className="text-sm font-semibold">Welcome back, {user?.firstName || "Customer"}</h1>
          <Badge variant="outline" className="text-xs">{user?.primaryEmailAddress?.emailAddress}</Badge>
        </header>

        <div className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-raised">
              <CardHeader className="pb-2"><CardTitle className="text-xs text-[var(--text-muted)]">Current Plan</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold">Debt Resolution</p>
                <p className="text-xs text-[var(--text-secondary)]">$199.00/month</p>
              </CardContent>
            </Card>
            <Card className="glass-raised">
              <CardHeader className="pb-2"><CardTitle className="text-xs text-[var(--text-muted)]">Next Charge</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold">Jul 10, 2026</p>
                <p className="text-xs text-[var(--text-secondary)]">$199.00</p>
              </CardContent>
            </Card>
            <Card className="glass-raised">
              <CardHeader className="pb-2"><CardTitle className="text-xs text-[var(--text-muted)]">Payment Method</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg font-bold">•••• 4242</p>
                <p className="text-xs text-[var(--text-secondary)]">Visa — Expires 12/28</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button className="emerald-gradient h-12 text-sm">Pay Now</Button>
            <Button variant="secondary" className="h-12 text-sm">Update Card</Button>
            <Button variant="secondary" className="h-12 text-sm">Pause Plan</Button>
            <Button variant="secondary" className="h-12 text-sm text-red-400 hover:text-red-300">Cancel Plan</Button>
          </div>

          {/* Recent Activity */}
          <Card className="glass-raised">
            <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ActivityItem text="Payment of $199.00 processed" time="Jun 10, 2026" status="success" />
              <ActivityItem text="Payment method updated" time="Jun 1, 2026" status="info" />
              <ActivityItem text="Plan activated" time="May 15, 2026" status="info" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs transition-colors ${
        active
          ? "bg-[var(--emerald-glow)] text-[var(--emerald)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </Link>
  );
}

function ActivityItem({ text, time, status }: { text: string; time: string; status: "success" | "info" }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${status === "success" ? "bg-[var(--emerald)]" : "bg-[var(--text-muted)]"}`} />
      <div className="flex-1">
        <p className="text-[var(--text-secondary)]">{text}</p>
        <p className="text-[var(--text-muted)] mt-0.5">{time}</p>
      </div>
    </div>
  );
}
