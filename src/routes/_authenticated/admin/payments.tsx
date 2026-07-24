import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: Payments,
});

const PRESETS = [
  { provider: "razorpay", display_name: "Razorpay" },
  { provider: "stripe", display_name: "Stripe" },
  { provider: "paypal", display_name: "PayPal" },
  { provider: "cod", display_name: "Cash on Delivery" },
  { provider: "phonepe", display_name: "PhonePe" },
  { provider: "phone_otp", display_name: "Phone OTP / SMS (Twilio)" },
];

function Payments() {
  const qc = useQueryClient();
  const [newProvider, setNewProvider] = useState("razorpay");
  const { data } = useQuery({
    queryKey: ["gateways-admin"],
    queryFn: async () => (await supabase.from("payment_gateways").select("*").order("sort_order")).data ?? [],
  });

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("payment_gateways").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["gateways-admin"] });
  };
  const add = async () => {
    const preset = PRESETS.find((p) => p.provider === newProvider);
    if (!preset) return;
    const { error } = await supabase.from("payment_gateways").insert({ provider: preset.provider, display_name: preset.display_name });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["gateways-admin"] });
  };
  const del = async (id: string) => {
    if (!confirm("Remove gateway slot?")) return;
    await supabase.from("payment_gateways").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["gateways-admin"] });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl mb-2">Payment Gateways</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Configure the payment providers your store offers. Paste the publishable key here; secret keys go under Cloud → Secrets so they never touch the browser.
        When ready, ask us to wire the checkout for the enabled gateway.
      </p>

      <div className="card-elegant p-4 mb-6 flex gap-2">
        <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)} className="px-3 py-2 rounded border border-input bg-background flex-1">
          {PRESETS.map((p) => <option key={p.provider} value={p.provider}>{p.display_name}</option>)}
        </select>
        <button onClick={add} className="btn-primary hover:bg-primary/90 text-sm"><Plus className="h-4 w-4"/> Add gateway slot</button>
      </div>

      <div className="space-y-3">
        {data?.map((g: any) => (
          <div key={g.id} className="card-elegant p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-heading text-lg">{g.display_name}</div>
                <div className="text-xs text-muted-foreground font-mono">{g.provider}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={g.enabled} onChange={(e) => update(g.id, { enabled: e.target.checked })} /> Enabled</label>
                <button onClick={() => del(g.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Mode</label>
                <select value={g.mode} onChange={(e) => update(g.id, { mode: e.target.value })} className="w-full mt-1 px-3 py-2 rounded border border-input bg-background">
                  <option value="test">Test</option><option value="live">Live</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Publishable / public key</label>
                <input value={g.public_key ?? ""} onChange={(e) => update(g.id, { public_key: e.target.value })} className="w-full mt-1 px-3 py-2 rounded border border-input bg-background font-mono text-sm" placeholder="pk_live_… / rzp_live_… etc." />
              </div>
            </div>
            {g.provider === "phone_otp" && (
              <p className="text-xs text-muted-foreground mt-3">Phone OTP needs a Twilio account (paid per SMS). Enter Account SID / Auth Token as secrets, then ask us to wire the OTP flow.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
