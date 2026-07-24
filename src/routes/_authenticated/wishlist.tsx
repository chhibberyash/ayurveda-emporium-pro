import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { Trash2, Heart, Leaf } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Amrita Ayurveda" },
      { name: "description", content: "Your saved Ayurvedic soaps." },
      { property: "og:title", content: "Wishlist — Amrita Ayurveda" },
      { property: "og:description", content: "Your saved Ayurvedic soaps." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { user } = useSession();
  const s = useSiteSettings();
  const { add } = useCart();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("wishlists").select("*, products(*)").eq("user_id", user!.id);
      return data ?? [];
    },
  });
  const removeItem = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["wishlist"] });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <h1 className="font-heading text-4xl text-center">Your Wishlist</h1>
        <div className="ornament my-4 max-w-xs mx-auto" />
        {!data?.length ? (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" strokeWidth={1} />
            <p className="mt-4 text-muted-foreground">No favorites yet.</p>
            <Link to="/shop" className="btn-primary hover:bg-primary/90 mt-6 inline-flex">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {data.map((w: any) => (
              <div key={w.id} className="card-elegant overflow-hidden">
                <Link to="/product/$slug" params={{ slug: w.products.slug }} className="block aspect-square bg-muted">
                  {w.products.image_url ? <img src={w.products.image_url} alt={w.products.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-accent/20"><Leaf className="h-12 w-12 text-primary/40" strokeWidth={1}/></div>}
                </Link>
                <div className="p-4">
                  <Link to="/product/$slug" params={{ slug: w.products.slug }} className="font-heading text-lg">{w.products.name}</Link>
                  <p className="text-primary font-heading">{money(w.products.price, s.currency_symbol)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { add({ id: w.products.id, name: w.products.name, slug: w.products.slug, price: Number(w.products.price), image_url: w.products.image_url }); toast.success("Added to cart"); }} className="btn-primary hover:bg-primary/90 text-xs flex-1">Add to cart</button>
                    <button onClick={() => removeItem(w.id)} className="btn-outline p-2"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
