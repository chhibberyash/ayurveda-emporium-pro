import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { money } from "@/lib/format";
import { Heart, Leaf, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Amrita Ayurveda` },
      { name: "description", content: "Handcrafted Ayurvedic soap from Amrita Ayurveda." },
      { property: "og:title", content: `${params.slug} — Amrita Ayurveda` },
      { property: "og:description", content: "Handcrafted Ayurvedic soap from Amrita Ayurveda." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const s = useSiteSettings();
  const { add } = useCart();
  const { user } = useSession();
  const [qty, setQty] = useState(1);

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name,slug)").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as any;
    },
  });

  const addWishlist = async () => {
    if (!user) return toast.error("Sign in to save favorites");
    const { error } = await supabase.from("wishlists").upsert({ user_id: user.id, product_id: p.id });
    if (error) toast.error(error.message); else toast.success("Added to wishlist");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!p) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-10">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span className="text-foreground">{p.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-lg bg-gradient-to-br from-secondary to-accent/20 overflow-hidden flex items-center justify-center">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Leaf className="h-32 w-32 text-primary/40" strokeWidth={0.75} />
            )}
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent">{p.categories?.name ?? "Ayurveda"}</p>
            <h1 className="font-heading text-4xl mt-2">{p.name}</h1>
            <div className="ornament my-4 max-w-xs" />
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl text-primary">{money(p.price, s.currency_symbol)}</span>
              {p.compare_at_price && p.compare_at_price > p.price && (
                <span className="text-muted-foreground line-through">{money(p.compare_at_price, s.currency_symbol)}</span>
              )}
            </div>
            <p className="mt-4 text-muted-foreground">{p.short_description}</p>
            <p className={`mt-2 text-sm ${p.stock > 0 ? "text-primary" : "text-destructive"}`}>
              {p.stock > 0 ? `In stock — ${p.stock} available` : "Sold out"}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-input rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
                <span className="px-4 min-w-[3ch] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
              </div>
              <button
                onClick={() => { add({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), image_url: p.image_url }, qty); toast.success("Added to cart"); }}
                disabled={p.stock === 0}
                className="btn-primary hover:bg-primary/90 flex-1 disabled:opacity-50"
              >
                Add to cart
              </button>
              <button onClick={addWishlist} className="btn-outline p-2.5" aria-label="Wishlist"><Heart className="h-5 w-5" /></button>
            </div>

            <div className="mt-8 space-y-4">
              {p.description && (<div><h3 className="font-heading text-lg mb-1">Description</h3><p className="text-sm text-muted-foreground">{p.description}</p></div>)}
              {p.ingredients && (<div><h3 className="font-heading text-lg mb-1">Ingredients</h3><p className="text-sm text-muted-foreground">{p.ingredients}</p></div>)}
              {p.benefits && (<div><h3 className="font-heading text-lg mb-1">Benefits</h3><p className="text-sm text-muted-foreground">{p.benefits}</p></div>)}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
