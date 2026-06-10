"use client";
import Link from "next/link";
import { Leaf, RefreshCw, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortalSubscriptionsPage() {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 border-r border-[var(--border)] glass shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
          <Link href="/portal" className="no-underline inline-flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-[var(--emerald)]" /><span className="text-xs font-bold">NewLeaf <span className="text-[var(--emerald)]">Portal</span></span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6">
          <h1 className="text-sm font-semibold">Subscriptions</h1>
        </header>
        <div className="p-6 space-y-4">
          <Card className="glass-raised"><CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-sm font-semibold">Debt Resolution Program</p><p className="text-xs text-[var(--text-muted)]">$199.00/month · Next: Jul 10, 2026</p></div>
              <Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">Active</Badge>
            </div>
            <div className="flex gap-2"><Button variant="secondary" size="sm" className="h-8 text-xs"><Pause className="w-3 h-3 mr-1" />Pause</Button><Button variant="secondary" size="sm" className="h-8 text-xs text-red-400"><X className="w-3 h-3 mr-1" />Cancel</Button></div>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
