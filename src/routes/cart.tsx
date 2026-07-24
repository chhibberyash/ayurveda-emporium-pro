import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart";
import { useSiteSettings } from "@/lib/settings";
import { useSession } from "@/lib/session";
import { money } from "@/lib/format";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Amrita Ayurveda" },
      { name: "description", content: "Review your Ayurveda soap selections." },
      { property: "og:title", content: "Your Cart — Amrita Ayurveda" },
      { property: "og:description", content: "Review your Ayurveda soap selections." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const s = useSiteSettings();
  const { user } = useSession();
  const navigate = useNavigate();
  const shipping = subtotal >= s.free_shipping_threshold ? 0 : subtotal > 0 ? Number(s.shipping_flat_rate) : 0;
  const total = subtotal + shipping;

  const checkout = () => {
    if (!user) return navigate({ to: "/auth" });
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <h1 className="font-heading text-4xl text-center">Your Cart</h1>
        <div className="ornament my-4 max-w-xs mx-auto" />
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" strokeWidth={1} />
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="btn-primary hover:bg-primary/90 mt-6 inline-flex">Browse Soaps</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <div key={it.id} className="card-elegant p-4 flex gap-4 items-center">
                  <div className="h-20 w-20 rounded bg-secondary flex-shrink-0 overflow-hidden">
                    {it.image_url && <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <Link to="/product/$slug" params={{ slug: it.slug }} className="font-heading text-lg hover:text-primary">{it.name}</Link>
                    <p className="text-sm text-muted-foreground">{money(it.price, s.currency_symbol)}</p>
                  </div>
                  <div className="flex items-center border border-input rounded-full">
                    <button onClick={() => setQty(it.id, it.quantity - 1)} className="p-2"><Minus className="h-4 w-4" /></button>
                    <span className="px-3">{it.quantity}</span>
                    <button onClick={() => setQty(it.id, it.quantity + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="font-heading w-24 text-right">{money(it.price * it.quantity, s.currency_symbol)}</div>
                  <button onClick={() => remove(it.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="card-elegant p-6 h-fit">
              <h2 className="font-heading text-xl mb-4">Order Summary</h2>
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>{money(subtotal, s.currency_symbol)}</span></div>
              <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping, s.currency_symbol)}</span></div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-heading text-lg mb-4"><span>Total</span><span>{money(total, s.currency_symbol)}</span></div>
              <button onClick={checkout} className="w-full btn-primary hover:bg-primary/90">
                {user ? "Proceed to Checkout" : "Sign in to Checkout"}
              </button>
              <Link to="/shop" className="block text-center text-sm text-muted-foreground mt-3 hover:text-foreground">Continue shopping</Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
