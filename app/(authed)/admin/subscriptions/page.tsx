"use client";
import Link from "next/link";
import { Leaf, RefreshCw, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionsPage() {
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
          <h1 className="text-sm font-semibold">Subscriptions</h1>
        </header>
        <div className="p-6">
          <Card className="glass-raised"><CardContent className="p-0">
            <Table><TableHeader><TableRow className="border-[var(--border)]"><TableHead className="text-xs text-[var(--text-muted)]">Customer</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Amount</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Next Charge</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow className="border-[var(--border)]"><TableCell className="text-xs">cust_001</TableCell><TableCell className="text-xs">$199.00/mo</TableCell><TableCell className="text-xs">2026-07-10</TableCell><TableCell><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">active</Badge></TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-7 text-xs"><Pause className="w-3 h-3" /></Button><Button variant="ghost" size="sm" className="h-7 text-xs text-red-400"><X className="w-3 h-3" /></Button></div></TableCell></TableRow>
              </TableBody></Table>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
