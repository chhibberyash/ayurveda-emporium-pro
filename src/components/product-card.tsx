import { Link } from "@tanstack/react-router";
import { Heart, Leaf } from "lucide-react";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock: number;
};

export function ProductCard({ p, symbol }: { p: ProductCardData; symbol: string }) {
  const { add } = useCart();
  const { user } = useSession();
  const addWishlist = async () => {
    if (!user) return toast.error("Sign in to save favorites");
    const { error } = await supabase.from("wishlists").upsert({ user_id: user.id, product_id: p.id });
    if (error) toast.error(error.message);
    else toast.success("Added to wishlist");
  };
  return (
    <div className="group card-elegant overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block aspect-square bg-muted relative overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-accent/20">
            <Leaf className="h-12 w-12 text-primary/40" strokeWidth={1} />
          </div>
        )}
        <button onClick={(e) => { e.preventDefault(); addWishlist(); }} className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:text-primary" aria-label="Wishlist">
          <Heart className="h-4 w-4" />
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="font-heading text-lg text-foreground hover:text-primary">
          {p.name}
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.short_description}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-heading text-lg text-primary">{money(p.price, symbol)}</span>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <span className="ml-2 text-xs text-muted-foreground line-through">{money(p.compare_at_price, symbol)}</span>
            )}
          </div>
          <button
            onClick={() => { add({ id: p.id, name: p.name, slug: p.slug, price: p.price, image_url: p.image_url }); toast.success("Added to cart"); }}
            disabled={p.stock === 0}
            className="btn-primary hover:bg-primary/90 disabled:opacity-50 text-xs px-3 py-1.5"
          >
            {p.stock === 0 ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
