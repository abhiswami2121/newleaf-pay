"use client";
import Link from "next/link";
import { Leaf, Webhook, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WebhooksPage() {
  const events = [
    { id: "evt_001", type: "payment_succeeded", data: "pay_7n6j9Vm...", time: "Just now", valid: true },
    { id: "evt_002", type: "payment_processing", data: "pay_abc123...", time: "2 min ago", valid: true },
    { id: "evt_003", type: "mandate_active", data: "mnd_xyz789", time: "10 min ago", valid: true },
  ];

  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 border-r border-[var(--border)] glass shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
          <Link href="/admin" className="no-underline inline-flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-[var(--emerald)]" /><span className="text-xs font-bold">NewLeaf <span className="text-[var(--emerald)]">Admin</span></span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6">
          <h1 className="text-sm font-semibold">Webhook Events</h1>
        </header>
        <div className="p-6 space-y-3">
          {events.map((evt) => (
            <Card key={evt.id} className="glass-raised">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {evt.valid ? <CheckCircle className="w-4 h-4 text-[var(--emerald)]" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">{evt.type}</Badge>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{evt.data}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{evt.time}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
