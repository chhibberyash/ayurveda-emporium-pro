import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  component: PagesAdmin,
});

function PagesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["pages-admin"],
    queryFn: async () => (await supabase.from("pages").select("*").order("slug")).data ?? [],
  });
  const save = async () => {
    if (!editing.title || !editing.slug) return toast.error("Title and slug required");
    const payload = { title: editing.title, slug: slugify(editing.slug), content: editing.content ?? "", published: editing.published !== false, updated_at: new Date().toISOString() };
    const { error } = editing.id
      ? await supabase.from("pages").update(payload).eq("id", editing.id)
      : await supabase.from("pages").insert(payload);
    if (error) return toast.error(error.message);
    setEditing(null); qc.invalidateQueries({ queryKey: ["pages-admin"] }); toast.success("Saved");
  };
  const del = async (id: string) => {
    if (!confirm("Delete page?")) return;
    await supabase.from("pages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["pages-admin"] });
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl">Pages</h1>
        <button onClick={() => setEditing({ published: true })} className="btn-primary hover:bg-primary/90 text-sm"><Plus className="h-4 w-4"/> New page</button>
      </div>
      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Title</th><th className="p-3">Slug</th><th className="p-3">Status</th><th></th></tr></thead>
          <tbody>
            {data?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.title}</td><td className="p-3 text-muted-foreground font-mono">{p.slug}</td>
                <td className="p-3">{p.published ? "Published" : "Draft"}</td>
                <td className="p-3 flex gap-2"><button onClick={() => setEditing(p)}><Pencil className="h-4 w-4"/></button><button onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card-elegant p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-4">{editing.id ? "Edit" : "New"} page</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Slug (e.g. about)" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background font-mono" />
              <textarea placeholder="HTML content" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background min-h-[240px] font-mono text-sm" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published !== false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
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
