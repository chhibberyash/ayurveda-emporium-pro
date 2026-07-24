import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { Search } from "lucide-react";

type Search = { q?: string; category?: string; sort?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: (search.q as string) || undefined,
    category: (search.category as string) || undefined,
    sort: (search.sort as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Soaps — Amrita Ayurveda" },
      { name: "description", content: "Browse our full collection of handcrafted Ayurvedic soaps." },
      { property: "og:title", content: "Shop All Soaps — Amrita Ayurveda" },
      { property: "og:description", content: "Browse our full collection of handcrafted Ayurvedic soaps." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const s = useSiteSettings();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const { data: categories } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", search.category, search.sort],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id,name,slug,short_description,price,compare_at_price,image_url,stock,category_id,categories(slug)")
        .eq("active", true);
      if (search.sort === "price_asc") query = query.order("price", { ascending: true });
      else if (search.sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (search.category && p.categories?.slug !== search.category) return false;
      if (search.q) {
        const t = search.q.toLowerCase();
        if (!p.name.toLowerCase().includes(t) && !(p.short_description?.toLowerCase() ?? "").includes(t)) return false;
      }
      return true;
    });
  }, [products, search.category, search.q]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { ...search, q } as any });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-accent">Collection</p>
          <h1 className="font-heading text-4xl mt-2">The Soap Atelier</h1>
          <div className="ornament my-4 max-w-xs mx-auto" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <form onSubmit={applySearch} className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search soaps..." className="w-full pl-9 pr-3 py-2 rounded-full border border-input bg-background" />
          </form>
          <select
            value={search.category ?? ""}
            onChange={(e) => navigate({ search: { ...search, category: e.target.value || undefined } as any })}
            className="px-3 py-2 rounded-full border border-input bg-background text-sm"
          >
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select
            value={search.sort ?? "newest"}
            onChange={(e) => navigate({ search: { ...search, sort: e.target.value } as any })}
            className="px-3 py-2 rounded-full border border-input bg-background text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No products match your filters.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} p={p as ProductCardData} symbol={s.currency_symbol} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
