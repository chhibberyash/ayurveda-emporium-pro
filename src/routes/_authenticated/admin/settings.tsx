import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings-admin"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    const { error } = await supabase.from("site_settings").update({ ...form, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["settings-admin"] });
  };

  const fields = [
    ["site_name", "Site name"], ["tagline", "Tagline"], ["logo_url", "Logo URL"],
    ["contact_email", "Contact email"], ["contact_phone", "Contact phone"], ["address", "Address"],
    ["currency", "Currency code"], ["currency_symbol", "Currency symbol"],
    ["hero_title", "Hero title"], ["hero_subtitle", "Hero subtitle"], ["hero_image_url", "Hero image URL"],
    ["footer_text", "Footer text"],
    ["social_instagram", "Instagram URL"], ["social_facebook", "Facebook URL"], ["social_twitter", "Twitter URL"],
    ["about_snippet", "About snippet"],
  ];
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl mb-6">Site Settings</h1>
      <div className="card-elegant p-6 space-y-3">
        {fields.map(([k, label]) => (
          <div key={k}>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
            <input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full mt-1 px-3 py-2 rounded border border-input bg-background" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Shipping flat rate</label>
            <input type="number" value={form.shipping_flat_rate ?? 0} onChange={(e) => setForm({ ...form, shipping_flat_rate: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded border border-input bg-background" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Free shipping above</label>
            <input type="number" value={form.free_shipping_threshold ?? 0} onChange={(e) => setForm({ ...form, free_shipping_threshold: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded border border-input bg-background" />
          </div>
        </div>
        <button onClick={save} className="btn-primary hover:bg-primary/90 mt-4">Save changes</button>
      </div>
    </div>
  );
}
