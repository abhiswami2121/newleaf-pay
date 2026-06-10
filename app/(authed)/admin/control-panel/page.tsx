"use client";

import Link from "next/link";
import { Leaf, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STYLE_IDS = [
  { id: "newleaf-one-time", theme: "#000000", desc: "Standard one-time payment" },
  { id: "newleaf-recovery", theme: "#D97706", desc: "Recovery / debt catch-up" },
  { id: "newleaf-sub-signup", theme: "#000000", desc: "Subscription signup with mandate" },
  { id: "newleaf-upgrade", theme: "#000000", desc: "Plan upgrade authorization" },
  { id: "newleaf-resume", theme: "#10B981", desc: "Resume paused plan" },
];

export default function ControlPanelPage() {
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
          <h1 className="text-sm font-semibold">Control Panel</h1>
        </header>

        <div className="p-6 space-y-6">
          {/* Style IDs */}
          <Card className="glass-raised">
            <CardHeader><CardTitle className="text-sm">Payment Link Styles</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {STYLE_IDS.map((style) => (
                <div key={style.id} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--bg-input)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{style.id}</span>
                      <Badge variant="outline" className="text-xs">{style.theme}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{style.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-[var(--border)]" style={{ background: style.theme }} />
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Connector Status */}
          <Card className="glass-raised">
            <CardHeader><CardTitle className="text-sm">Connector Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatusRow label="NMI Connector" value="active" status="good" />
              <StatusRow label="Merchant ID" value="newleaf_test_001" status="good" />
              <StatusRow label="Profile ID" value="pro_FcTsudWLf271LHfKBBnG" status="good" />
              <StatusRow label="API Key" value="snd_TH0...2CNuC" status="good" />
              <StatusRow label="Webhook Secret" value="JrT5tA...IlH" status="good" />
              <StatusRow label="Environment" value="sandbox" status="warn" />
            </CardContent>
          </Card>

          {/* Webhook Config */}
          <Card className="glass-raised">
            <CardHeader><CardTitle className="text-sm">Webhook Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Webhook URL</Label>
                <Input value="https://pay.newleaf.financial/api/webhook/hyperswitch" readOnly className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">HMAC Secret</Label>
                <Input type="password" value="JrT5tAyyCJseTUnZTGNBkzSzDHMHPTmt54TsCYTYLLAvKoCp18a7kSwcQu9IlH" readOnly className="h-9 text-sm font-mono" />
              </div>
              <Button size="sm" className="emerald-gradient h-8 text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatusRow({ label, value, status }: { label: string; value: string; status: "good" | "warn" | "error" }) {
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono">{value}</span>
        <div className={`w-2 h-2 rounded-full ${status === "good" ? "bg-[var(--emerald)]" : status === "warn" ? "bg-amber-400" : "bg-red-400"}`} />
      </div>
    </div>
  );
}
