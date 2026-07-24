import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: Categories,
});

function Categories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["cats-admin-full"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const payload: any = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description,
      image_url: editing.image_url,
      sort_order: Number(editing.sort_order) || 0,
      active: editing.active !== false,
    };
    const { error } = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    setEditing(null); qc.invalidateQueries({ queryKey: ["cats-admin-full"] }); toast.success("Saved");
  };
  const del = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cats-admin-full"] });
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl">Categories</h1>
        <button onClick={() => setEditing({ active: true, sort_order: 0 })} className="btn-primary hover:bg-primary/90 text-sm"><Plus className="h-4 w-4" /> New</button>
      </div>
      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Order</th><th className="p-3">Active</th><th></th></tr></thead>
          <tbody>
            {data?.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.name}</td><td className="p-3 text-muted-foreground">{c.slug}</td><td className="p-3">{c.sort_order}</td><td className="p-3">{c.active ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-2"><button onClick={() => setEditing(c)}><Pencil className="h-4 w-4"/></button><button onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card-elegant p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-4">{editing.id ? "Edit" : "New"} category</h2>
            <div className="space-y-3">
              <input placeholder="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Slug (auto)" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Image URL" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input type="number" placeholder="Sort order" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
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
