"use client";
import Link from "next/link";
import { Leaf, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CustomersPage() {
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
          <h1 className="text-sm font-semibold">Customers</h1>
          <div className="relative"><Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><Input placeholder="Search customers..." className="h-8 pl-9 text-xs w-60" /></div>
        </header>
        <div className="p-6">
          <Card className="glass-raised"><CardContent className="p-0">
            <Table><TableHeader><TableRow className="border-[var(--border)]"><TableHead className="text-xs text-[var(--text-muted)]">ID</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Email</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Vault</TableHead><TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow className="border-[var(--border)]"><TableCell className="text-xs font-mono">cust_001</TableCell><TableCell className="text-xs">user@example.com</TableCell><TableCell className="text-xs font-mono">vlt_a1b2c3d4</TableCell><TableCell><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">active</Badge></TableCell></TableRow>
              </TableBody></Table>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}
