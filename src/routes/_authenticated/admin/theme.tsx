import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/theme")({
  component: ThemeAdmin,
});

const FONTS = ["Cormorant Garamond", "Playfair Display", "Lora", "Inter", "Poppins", "DM Sans", "Space Grotesk"];

function ThemeAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["theme-admin"],
    queryFn: async () => (await supabase.from("theme_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const preview = () => {
    if (!form) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", form.primary_color);
    root.style.setProperty("--accent", form.accent_color);
    root.style.setProperty("--background", form.background_color);
    root.style.setProperty("--foreground", form.foreground_color);
    root.style.setProperty("--radius", form.radius);
  };

  const save = async () => {
    const { error } = await supabase.from("theme_settings").upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Theme saved — reloading");
    qc.invalidateQueries({ queryKey: ["theme-admin"] });
    preview();
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl mb-6">Theme Customizer</h1>
      <div className="card-elegant p-6 space-y-4">
        {[
          ["primary_color", "Primary color"], ["accent_color", "Accent color"],
          ["background_color", "Background"], ["foreground_color", "Foreground text"],
        ].map(([k, label]) => (
          <div key={k} className="flex items-center gap-3">
            <label className="w-40 text-sm">{label}</label>
            <input type="color" value={form[k] ?? "#000000"} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-10 w-16 rounded border border-input" />
            <input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="flex-1 px-3 py-2 rounded border border-input bg-background font-mono text-sm" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <label className="w-40 text-sm">Border radius</label>
          <input value={form.radius ?? "0.5rem"} onChange={(e) => setForm({ ...form, radius: e.target.value })} className="flex-1 px-3 py-2 rounded border border-input bg-background" />
        </div>
        <div className="flex items-center gap-3">
          <label className="w-40 text-sm">Heading font</label>
          <select value={form.heading_font ?? "Cormorant Garamond"} onChange={(e) => setForm({ ...form, heading_font: e.target.value })} className="flex-1 px-3 py-2 rounded border border-input bg-background">
            {FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="w-40 text-sm">Body font</label>
          <select value={form.body_font ?? "Inter"} onChange={(e) => setForm({ ...form, body_font: e.target.value })} className="flex-1 px-3 py-2 rounded border border-input bg-background">
            {FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={preview} className="btn-outline text-sm">Preview</button>
          <button onClick={save} className="btn-primary hover:bg-primary/90">Save theme</button>
        </div>
        <p className="text-xs text-muted-foreground">Fonts render at their best when the Google Font is available. Cormorant, Playfair, Lora and Inter are already loaded.</p>
      </div>
    </div>
  );
}
