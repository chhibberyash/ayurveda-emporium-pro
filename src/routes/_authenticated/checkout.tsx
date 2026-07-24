import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { useSiteSettings } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Amrita Ayurveda" },
      { name: "description", content: "Complete your order." },
      { property: "og:title", content: "Checkout — Amrita Ayurveda" },
      { property: "og:description", content: "Complete your order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { user } = useSession();
  const { items, subtotal, clear } = useCart();
  const s = useSiteSettings();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "India" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: gateways } = useQuery({
    queryKey: ["gateways"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_gateways").select("*").eq("enabled", true).neq("provider", "phone_otp").order("sort_order");
      return data ?? [];
    },
  });

  const shipping = subtotal >= s.free_shipping_threshold ? 0 : (items.length ? Number(s.shipping_flat_rate) : 0);
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("active", true).maybeSingle();
    if (!data) return toast.error("Invalid coupon");
    if (data.expires_at && new Date(data.expires_at) < new Date()) return toast.error("Coupon expired");
    if (subtotal < Number(data.min_order)) return toast.error(`Minimum order ${money(data.min_order, s.currency_symbol)}`);
    if (data.usage_limit && data.used_count >= data.usage_limit) return toast.error("Coupon exhausted");
    const d = data.discount_type === "percent" ? (subtotal * Number(data.discount_value)) / 100 : Number(data.discount_value);
    setDiscount(d);
    toast.success(`Discount ${money(d, s.currency_symbol)} applied`);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return toast.error("Cart empty");
    if (!payment) return toast.error("Choose a payment method");
    setBusy(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user!.id,
        subtotal,
        discount,
        shipping,
        total,
        coupon_code: couponCode || null,
        payment_method: payment,
        payment_status: payment === "cod" ? "pending" : "pending",
        shipping_address: address,
        status: "pending",
      }).select("id, order_number").single();
      if (error || !order) throw error;
      const oi = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
      }));
      const { error: e2 } = await supabase.from("order_items").insert(oi);
      if (e2) throw e2;
      clear();
      toast.success(`Order placed: ${order.order_number}`);
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Order failed");
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container-page py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="btn-primary hover:bg-primary/90 mt-6 inline-flex">Browse Shop</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <h1 className="font-heading text-4xl text-center">Checkout</h1>
        <div className="ornament my-4 max-w-xs mx-auto" />
        <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-elegant p-6">
              <h2 className="font-heading text-xl mb-4">Shipping address</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ["full_name", "Full name", true],
                  ["phone", "Phone", true],
                  ["line1", "Address line 1", true, "sm:col-span-2"],
                  ["line2", "Address line 2 (optional)", false, "sm:col-span-2"],
                  ["city", "City", true],
                  ["state", "State", true],
                  ["postal_code", "Postal code", true],
                  ["country", "Country", true],
                ].map(([k, label, req, cls]) => (
                  <input
                    key={k as string}
                    required={!!req}
                    placeholder={label as string}
                    value={(address as any)[k as string]}
                    onChange={(e) => setAddress({ ...address, [k as string]: e.target.value })}
                    className={`px-3 py-2 rounded border border-input bg-background ${cls ?? ""}`}
                  />
                ))}
              </div>
            </div>

            <div className="card-elegant p-6">
              <h2 className="font-heading text-xl mb-4">Payment method</h2>
              {!gateways?.length ? (
                <p className="text-sm text-muted-foreground">No payment method available. Please contact the store.</p>
              ) : (
                <div className="space-y-2">
                  {gateways.map((g: any) => (
                    <label key={g.id} className="flex items-center gap-3 p-3 rounded border border-border cursor-pointer hover:bg-secondary/50">
                      <input type="radio" name="payment" value={g.provider} checked={payment === g.provider} onChange={(e) => setPayment(e.target.value)} />
                      <span>{g.display_name}</span>
                      {g.mode === "test" && <span className="ml-auto text-xs text-muted-foreground">Test mode</span>}
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">Payment gateways can be configured by the admin. Cash on Delivery works out of the box.</p>
            </div>
          </div>

          <div className="card-elegant p-6 h-fit">
            <h2 className="font-heading text-xl mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity, s.currency_symbol)}</span></div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2 rounded border border-input bg-background text-sm" />
              <button type="button" onClick={applyCoupon} className="btn-outline text-xs">Apply</button>
            </div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{money(subtotal, s.currency_symbol)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-primary"><span>Discount</span><span>−{money(discount, s.currency_symbol)}</span></div>}
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping, s.currency_symbol)}</span></div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between font-heading text-lg mb-4"><span>Total</span><span>{money(total, s.currency_symbol)}</span></div>
            <button disabled={busy} type="submit" className="w-full btn-primary hover:bg-primary/90 disabled:opacity-50">
              {busy ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
