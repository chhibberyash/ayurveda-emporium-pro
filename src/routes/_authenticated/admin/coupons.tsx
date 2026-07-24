import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: Coupons,
});

function Coupons() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const save = async () => {
    if (!editing.code) return toast.error("Code required");
    const payload = {
      code: editing.code.toUpperCase(),
      discount_type: editing.discount_type || "percent",
      discount_value: Number(editing.discount_value) || 0,
      min_order: Number(editing.min_order) || 0,
      usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
      expires_at: editing.expires_at || null,
      active: editing.active !== false,
    };
    const { error } = editing.id
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    setEditing(null); qc.invalidateQueries({ queryKey: ["coupons"] }); toast.success("Saved");
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["coupons"] });
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl">Coupons</h1>
        <button onClick={() => setEditing({ discount_type: "percent", active: true })} className="btn-primary hover:bg-primary/90 text-sm"><Plus className="h-4 w-4"/> New</button>
      </div>
      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Min order</th><th className="p-3">Used/Limit</th><th className="p-3">Expires</th><th className="p-3">Active</th><th></th></tr></thead>
          <tbody>
            {data?.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-mono">{c.code}</td><td className="p-3">{c.discount_type}</td><td className="p-3">{c.discount_value}</td><td className="p-3">₹{c.min_order}</td>
                <td className="p-3">{c.used_count}/{c.usage_limit ?? "∞"}</td>
                <td className="p-3 text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                <td className="p-3">{c.active ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-2"><button onClick={() => setEditing(c)}><Pencil className="h-4 w-4"/></button><button onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card-elegant p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-4">{editing.id ? "Edit" : "New"} coupon</h2>
            <div className="space-y-3">
              <input placeholder="CODE" value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 rounded border border-input bg-background font-mono" />
              <select value={editing.discount_type ?? "percent"} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background">
                <option value="percent">Percent %</option><option value="flat">Flat amount</option>
              </select>
              <input type="number" step="0.01" placeholder="Discount value" value={editing.discount_value ?? ""} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input type="number" step="0.01" placeholder="Min order (₹)" value={editing.min_order ?? 0} onChange={(e) => setEditing({ ...editing, min_order: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input type="number" placeholder="Usage limit (blank = unlimited)" value={editing.usage_limit ?? ""} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input type="datetime-local" placeholder="Expires" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="btn-outline text-sm">Cancel</button>
              <button onClick={save} className="btn-primary hover:bg-primary/90 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
