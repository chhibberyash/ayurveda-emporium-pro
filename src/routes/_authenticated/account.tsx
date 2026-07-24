import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Amrita Ayurveda" },
      { name: "description", content: "Your orders, profile and wishlist." },
      { property: "og:title", content: "My Account — Amrita Ayurveda" },
      { property: "og:description", content: "Your orders, profile and wishlist." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useSession();
  const s = useSiteSettings();
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container-page py-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Namaste</p>
            <h1 className="font-heading text-4xl mt-1">{profile?.full_name || user?.email}</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/wishlist" className="btn-outline text-sm">Wishlist</Link>
            <button onClick={signOut} className="btn-outline text-sm">Sign out</button>
          </div>
        </div>
        <div className="ornament my-4" />
        <h2 className="font-heading text-2xl mt-8 mb-4">Your Orders</h2>
        {!orders?.length ? (
          <div className="card-elegant p-8 text-center text-muted-foreground">
            No orders yet. <Link to="/shop" className="text-primary hover:underline">Browse the shop</Link>.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="card-elegant p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-heading text-lg">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-lg">{money(o.total, s.currency_symbol)}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-secondary capitalize">{o.status}</span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {(o.order_items ?? []).map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ")}
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
