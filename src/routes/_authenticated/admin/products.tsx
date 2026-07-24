import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

const empty = {
  id: "", name: "", slug: "", short_description: "", description: "", ingredients: "", benefits: "",
  price: 0, compare_at_price: 0, stock: 0, category_id: "", image_url: "", featured: false, active: true, tags: "",
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: cats } = useQuery({
    queryKey: ["cats-admin"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const save = async () => {
    if (!editing.name) return toast.error("Name required");
    const payload: any = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      short_description: editing.short_description,
      description: editing.description,
      ingredients: editing.ingredients,
      benefits: editing.benefits,
      price: Number(editing.price) || 0,
      compare_at_price: Number(editing.compare_at_price) || null,
      stock: Number(editing.stock) || 0,
      category_id: editing.category_id || null,
      image_url: editing.image_url || null,
      featured: !!editing.featured,
      active: !!editing.active,
      tags: typeof editing.tags === "string" ? editing.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : editing.tags,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl">Products</h1>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary hover:bg-primary/90 text-sm"><Plus className="h-4 w-4" /> New product</button>
      </div>

      <div className="card-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.active ? <span className="text-primary">Active</span> : <span className="text-muted-foreground">Hidden</span>}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setEditing({ ...p, tags: (p.tags ?? []).join(", ") })}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card-elegant p-6 w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-4">{editing.id ? "Edit" : "New"} product</h2>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="col-span-2 px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Slug (auto)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="px-3 py-2 rounded border border-input bg-background" />
              <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="px-3 py-2 rounded border border-input bg-background">
                <option value="">— Category —</option>
                {cats?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Price" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="px-3 py-2 rounded border border-input bg-background" />
              <input type="number" step="0.01" placeholder="Compare-at price" value={editing.compare_at_price ?? ""} onChange={(e) => setEditing({ ...editing, compare_at_price: e.target.value })} className="px-3 py-2 rounded border border-input bg-background" />
              <input type="number" placeholder="Stock" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Image URL" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="col-span-2 px-3 py-2 rounded border border-input bg-background" />
              <input placeholder="Short description" value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="col-span-2 px-3 py-2 rounded border border-input bg-background" />
              <textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="col-span-2 px-3 py-2 rounded border border-input bg-background min-h-[80px]" />
              <textarea placeholder="Ingredients" value={editing.ingredients ?? ""} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} className="px-3 py-2 rounded border border-input bg-background min-h-[60px]" />
              <textarea placeholder="Benefits" value={editing.benefits ?? ""} onChange={(e) => setEditing({ ...editing, benefits: e.target.value })} className="px-3 py-2 rounded border border-input bg-background min-h-[60px]" />
              <input placeholder="Tags (comma separated)" value={editing.tags ?? ""} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="col-span-2 px-3 py-2 rounded border border-input bg-background" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
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
