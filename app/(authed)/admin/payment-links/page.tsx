"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, CreditCard, Plus, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STYLE_IDS = ["newleaf-one-time", "newleaf-recovery", "newleaf-sub-signup", "newleaf-upgrade", "newleaf-resume"];

export default function PaymentLinksPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const mockLinks = [
    { id: "pay_7n6j9Vm5BTjiHG1FQTvu", customer: "cust_001", amount: "$100.00", style: "newleaf-one-time", status: "active", created: "2026-06-10" },
    { id: "pay_abc123def456", customer: "cust_002", amount: "$250.00", style: "newleaf-recovery", status: "active", created: "2026-06-09" },
  ];

  const copyLink = (id: string) => {
    const url = `https://pay.newleaf.financial/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 border-r border-[var(--border)] glass shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-[var(--border)]">
          <Link href="/admin" className="no-underline inline-flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-[var(--emerald)]" />
            <span className="text-xs font-bold">NewLeaf <span className="text-[var(--emerald)]">Admin</span></span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="glass border-b border-[var(--border)] h-14 flex items-center px-6 justify-between">
          <h1 className="text-sm font-semibold">Payment Links</h1>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger>
              <Button size="sm" className="emerald-gradient text-xs h-8">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-raised">
              <DialogHeader><DialogTitle>Create Payment Link</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs">Amount (USD)</Label>
                  <Input type="number" placeholder="100.00" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Customer ID</Label>
                  <Input placeholder="cust_001" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Style</Label>
                  <Select defaultValue="newleaf-one-time">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{STYLE_IDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Input placeholder="Payment for services" className="h-9 text-sm" />
                </div>
                <Button className="w-full emerald-gradient h-9 text-sm">Create Payment Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="p-6">
          <Card className="glass-raised">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)]">
                    <TableHead className="text-xs text-[var(--text-muted)]">Payment ID</TableHead>
                    <TableHead className="text-xs text-[var(--text-muted)]">Customer</TableHead>
                    <TableHead className="text-xs text-[var(--text-muted)]">Amount</TableHead>
                    <TableHead className="text-xs text-[var(--text-muted)]">Style</TableHead>
                    <TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead>
                    <TableHead className="text-xs text-[var(--text-muted)]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLinks.map((link) => (
                    <TableRow key={link.id} className="border-[var(--border)]">
                      <TableCell className="text-xs font-mono">{link.id.slice(0, 14)}...</TableCell>
                      <TableCell className="text-xs">{link.customer}</TableCell>
                      <TableCell className="text-xs">{link.amount}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{link.style}</Badge></TableCell>
                      <TableCell><Badge className="text-xs bg-[var(--emerald)]/20 text-[var(--emerald)]">{link.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => copyLink(link.id)}>
                            {copied === link.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                          <a href={`/pay/${link.id}`} target="_blank" rel="noopener">
                            <Button variant="ghost" size="sm" className="h-7 text-xs"><ExternalLink className="w-3 h-3" /></Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
