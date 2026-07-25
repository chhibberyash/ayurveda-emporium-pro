import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function ImageUploader({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success(`${label} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <div className="relative h-16 w-16 rounded border border-input overflow-hidden bg-muted">
            <img src={value} alt={label} className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded border border-dashed border-input bg-muted/40 flex items-center justify-center text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or upload"
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm"
          />
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-outline text-xs px-3 py-1.5"
            >
              {busy ? "Uploading…" : "Upload image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    toast.success("Saved — reloading");
    qc.invalidateQueries({ queryKey: ["settings-admin"] });
    setTimeout(() => window.location.reload(), 600);
  };

  const textFields: [string, string][] = [
    ["site_name", "Site name"], ["tagline", "Tagline"],
    ["contact_email", "Contact email"], ["contact_phone", "Contact phone"], ["address", "Address"],
    ["currency", "Currency code"], ["currency_symbol", "Currency symbol"],
    ["hero_title", "Hero title"], ["hero_subtitle", "Hero subtitle"],
    ["footer_text", "Footer text"],
    ["social_instagram", "Instagram URL"], ["social_facebook", "Facebook URL"], ["social_twitter", "Twitter URL"],
    ["about_snippet", "About snippet"],
  ];
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl mb-6">Site Settings</h1>
      <div className="card-elegant p-6 space-y-4">
        <ImageUploader
          label="Logo (shown in header)"
          value={form.logo_url}
          onChange={(url) => setForm({ ...form, logo_url: url })}
          folder="logo"
        />
        <ImageUploader
          label="Hero image"
          value={form.hero_image_url}
          onChange={(url) => setForm({ ...form, hero_image_url: url })}
          folder="hero"
        />
        {textFields.map(([k, label]) => (
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
