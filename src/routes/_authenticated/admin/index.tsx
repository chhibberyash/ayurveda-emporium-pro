import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const s = useSiteSettings();
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, users, lowStock] = await Promise.all([
        supabase.from("orders").select("total,status,created_at"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id,name,stock").lt("stock", 10).order("stock").limit(5),
      ]);
      const rows = orders.data ?? [];
      const revenue = rows.filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);
      return {
        revenue,
        orderCount: rows.length,
        productCount: products.count ?? 0,
        userCount: users.count ?? 0,
        lowStock: lowStock.data ?? [],
      };
    },
  });
  const { data: recent } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6)).data ?? [],
  });

  return (
    <div>
      <h1 className="font-heading text-3xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of your store.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Revenue", value: money(stats?.revenue ?? 0, s.currency_symbol), icon: IndianRupee },
          { label: "Orders", value: stats?.orderCount ?? 0, icon: ShoppingCart },
          { label: "Products", value: stats?.productCount ?? 0, icon: Package },
          { label: "Customers", value: stats?.userCount ?? 0, icon: Users },
        ].map((c, i) => (
          <div key={i} className="card-elegant p-5">
            <c.icon className="h-5 w-5 text-primary mb-2" />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="font-heading text-3xl mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="card-elegant p-5">
          <h2 className="font-heading text-lg mb-3">Recent Orders</h2>
          {!recent?.length ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
            <div className="space-y-2">
              {recent.map((o: any) => (
                <Link key={o.id} to="/admin/orders" className="flex justify-between text-sm p-2 rounded hover:bg-secondary">
                  <span>{o.order_number}</span>
                  <span className="capitalize text-muted-foreground">{o.status}</span>
                  <span className="font-heading">{money(o.total, s.currency_symbol)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card-elegant p-5">
          <h2 className="font-heading text-lg mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-accent" /> Low Stock</h2>
          {!stats?.lowStock?.length ? <p className="text-sm text-muted-foreground">All products well stocked.</p> : (
            <div className="space-y-2">
              {stats.lowStock.map((p: any) => (
                <div key={p.id} className="flex justify-between text-sm p-2 rounded hover:bg-secondary">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "text-destructive" : "text-accent"}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
