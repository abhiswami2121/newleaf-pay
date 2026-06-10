"use client";
import Link from "next/link";
import { Leaf, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
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
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6 justify-between">
          <h1 className="text-sm font-semibold">Products</h1>
          <Button size="sm" className="emerald-gradient text-xs h-8"><Plus className="w-3.5 h-3.5 mr-1" /> Add Product</Button>
        </header>
        <div className="p-6">
          <Card className="glass-raised"><CardContent className="p-0">
            <Table><TableHeader><TableRow className="border-[var(--border)]"><TableHead className="text-xs text-[var(--text-muted)]">Name</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Price</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Interval</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow className="border-[var(--border)]"><TableCell className="text-xs">Debt Resolution Program</TableCell><TableCell className="text-xs">$199/mo</TableCell><TableCell className="text-xs">Monthly</TableCell><TableCell><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">active</Badge></TableCell></TableRow>
                <TableRow className="border-[var(--border)]"><TableCell className="text-xs">Credit Repair Add-on</TableCell><TableCell className="text-xs">$99/mo</TableCell><TableCell className="text-xs">Monthly</TableCell><TableCell><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">active</Badge></TableCell></TableRow>
              </TableBody></Table>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
