"use client";
import Link from "next/link";
import { Leaf, CreditCard, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PaymentMethodsPage() {
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
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6 justify-between">
          <h1 className="text-sm font-semibold">Payment Methods</h1>
          <Button size="sm" className="emerald-gradient text-xs h-8"><Plus className="w-3.5 h-3.5 mr-1" /> Add Card</Button>
        </header>
        <div className="p-6 space-y-4">
          <Card className="glass-raised"><CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-600 to-blue-400" />
              <div>
                <div className="flex items-center gap-2"><p className="text-sm font-medium">•••• 4242</p><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">Default</Badge></div>
                <p className="text-xs text-[var(--text-muted)]">Visa · Expires 12/2028</p>
              </div>
            </div>
            <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-7 text-xs"><Trash2 className="w-3 h-3" /></Button></div>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
