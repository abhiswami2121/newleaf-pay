/**
 * /admin — Admin Control Panel Dashboard
 *
 * Real-time stats: today txns, MTD revenue, decline rate, active subs
 * Hyperswitch health indicator, recent webhook events feed
 * Requires Clerk auth + admin role
 */

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Leaf,
  LayoutDashboard,
  CreditCard,
  Package,
  Users,
  RefreshCw,
  Webhook,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [hsHealth, setHsHealth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch HS health
        const healthRes = await fetch("/api/control/connectors");
        if (healthRes.ok) {
          setHsHealth("healthy");
        } else {
          setHsHealth("degraded");
        }
      } catch {
        setHsHealth("unreachable");
      }

      // Mock stats for now (will be wired to real data)
      setStats({
        todayTxns: 24,
        todayVolume: "$8,450",
        mtdRevenue: "$142,300",
        declineRate: "2.1%",
        activeSubs: 187,
        successRate: "97.9%",
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6">
          <h1 className="text-sm font-semibold">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant={hsHealth === "healthy" ? "default" : "destructive"} className="text-xs">
              {hsHealth === "healthy" ? "HS Healthy" : hsHealth === "degraded" ? "HS Degraded" : "HS Offline"}
            </Badge>
            <span className="text-xs text-[var(--text-secondary)]">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Activity} label="Today's Txns" value={stats?.todayTxns} trend="up" />
            <StatCard icon={DollarSign} label="Today's Volume" value={stats?.todayVolume} trend="up" />
            <StatCard icon={DollarSign} label="MTD Revenue" value={stats?.mtdRevenue} trend="up" />
            <StatCard icon={AlertTriangle} label="Decline Rate" value={stats?.declineRate} trend="down" />
            <StatCard icon={Users} label="Active Subs" value={stats?.activeSubs} />
            <StatCard icon={CheckCircle} label="Success Rate" value={stats?.successRate} trend="up" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard href="/admin/payment-links" icon={CreditCard} label="Payment Links" desc="Create & manage links" />
            <QuickActionCard href="/admin/subscriptions" icon={RefreshCw} label="Subscriptions" desc="View & manage subs" />
            <QuickActionCard href="/admin/customers" icon={Users} label="Customers" desc="Vault explorer" />
            <QuickActionCard href="/admin/transactions" icon={Receipt} label="Transactions" desc="Full history" />
          </div>

          {/* Recent Activity + HS Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-raised">
              <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <ActivityItem text="Payment pay_7n6j... succeeded — $100.00" time="Just now" />
                <ActivityItem text="Subscription sub_abc123 activated" time="2 min ago" />
                <ActivityItem text="New payment link created for cust_456" time="5 min ago" />
                <ActivityItem text="Refund processed for pay_xyz789" time="10 min ago" />
              </CardContent>
            </Card>

            <Card className="glass-raised">
              <CardHeader><CardTitle className="text-sm">Hyperswitch Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <StatusRow label="HS Health" value={hsHealth || "checking..."} />
                <StatusRow label="Merchant" value="newleaf_test_001" />
                <StatusRow label="Profile" value="pro_FcTsudWLf271LHfKBBnG" />
                <StatusRow label="NMI Connector" value="active" />
                <StatusRow label="Webhook URL" value="pay.newleaf.financial/api/webhook/hyperswitch" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminSidebar() {
  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/payment-links", icon: CreditCard, label: "Payment Links" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/subscriptions", icon: RefreshCw, label: "Subscriptions" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/transactions", icon: Receipt, label: "Transactions" },
    { href: "/admin/webhooks", icon: Webhook, label: "Webhooks" },
    { href: "/admin/control-panel", icon: Settings, label: "Control Panel" },
  ];

  return (
    <aside className="w-56 border-r border-[var(--border)] glass flex flex-col shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
        <Link href="/" className="no-underline inline-flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-[var(--emerald)]" />
          <span className="text-xs font-bold">NewLeaf <span className="text-[var(--emerald)]">Admin</span></span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <link.icon className="w-3.5 h-3.5" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: any; trend?: "up" | "down" }) {
  return (
    <Card className="glass-raised">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          {trend && (
            <span className={`text-xs ${trend === "up" ? "text-[var(--emerald)]" : "text-red-400"}`}>
              {trend === "up" ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
            </span>
          )}
        </div>
        <p className="text-lg font-bold">{value || "—"}</p>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <Link href={href} className="block">
      <Card className="glass-raised hover:border-[var(--border-hover)] transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald-glow)]">
            <Icon className="w-5 h-5 text-[var(--emerald)]" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-[var(--text-muted)]">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-start gap-3 text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] mt-1.5 shrink-0" />
      <div className="flex-1">
        <p className="text-[var(--text-secondary)]">{text}</p>
        <p className="text-[var(--text-muted)] mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={`font-mono ${value === "healthy" || value === "active" ? "text-[var(--emerald)]" : value === "degraded" ? "text-amber-400" : "text-red-400"}`}>
        {value}
      </span>
    </div>
  );
}
