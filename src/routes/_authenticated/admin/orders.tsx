import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { useSiteSettings } from "@/lib/settings";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: Orders,
});

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];

function Orders() {
  const s = useSiteSettings();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*, order_items(*), profiles!inner(full_name)").order("created_at", { ascending: false });
      if (filter) q = q.eq("status", filter);
      return (await q).data ?? [];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success("Updated");
  };

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Orders</h1>
      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th><th></th></tr></thead>
          <tbody>
            {data?.map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3">{o.order_number}</td>
                <td className="p-3">{o.profiles?.full_name ?? "—"}</td>
                <td className="p-3">{money(o.total, s.currency_symbol)}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="px-2 py-1 rounded border border-input bg-background text-xs capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3"><button onClick={() => setView(o)} className="text-primary hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div className="card-elegant p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-2">{view.order_number}</h2>
            <p className="text-sm text-muted-foreground mb-4">{new Date(view.created_at).toLocaleString()} · Payment: {view.payment_method ?? "—"} ({view.payment_status})</p>
            <h3 className="font-heading text-lg mb-2">Items</h3>
            <div className="space-y-2 mb-4">
              {view.order_items?.map((i: any) => (
                <div key={i.id} className="flex justify-between text-sm"><span>{i.product_name} × {i.quantity}</span><span>{money(i.price * i.quantity, s.currency_symbol)}</span></div>
              ))}
            </div>
            <div className="border-t border-border pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(view.subtotal, s.currency_symbol)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>−{money(view.discount, s.currency_symbol)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{money(view.shipping, s.currency_symbol)}</span></div>
              <div className="flex justify-between font-heading text-lg"><span>Total</span><span>{money(view.total, s.currency_symbol)}</span></div>
            </div>
            {view.shipping_address && (
              <>
                <h3 className="font-heading text-lg mt-4 mb-2">Shipping</h3>
                <pre className="text-xs bg-secondary p-3 rounded whitespace-pre-wrap">{JSON.stringify(view.shipping_address, null, 2)}</pre>
              </>
            )}
            <button onClick={() => setView(null)} className="btn-outline text-sm mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
