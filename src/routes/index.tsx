import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Sparkles, Heart, Truck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amrita Ayurveda — Handcrafted Ayurvedic Soaps" },
      { name: "description", content: "Discover our small-batch Ayurvedic soaps: Neem-Tulsi, Sandalwood Rose, Turmeric Saffron and more." },
      { property: "og:title", content: "Amrita Ayurveda — Handcrafted Ayurvedic Soaps" },
      { property: "og:description", content: "Small-batch Ayurvedic soaps made with time-honored recipes." },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useSiteSettings();
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,short_description,price,compare_at_price,image_url,stock")
        .eq("featured", true)
        .eq("active", true)
        .limit(8);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["home-cats"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-accent/10 -z-10" />
          <div className="container-page py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">— Since Ancient Times —</p>
              <h1 className="font-heading text-5xl md:text-7xl leading-[1.05] text-foreground">
                {s.hero_title}
              </h1>
              <div className="ornament my-6 max-w-xs" />
              <p className="text-lg text-muted-foreground max-w-md">{s.hero_subtitle}</p>
              <div className="mt-8 flex gap-3">
                <Link to="/shop" className="btn-primary hover:bg-primary/90">Explore the Collection</Link>
                <Link to="/pages/$slug" params={{ slug: "about" }} className="btn-outline">Our Story</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full bg-gradient-to-br from-accent/30 to-primary/20 flex items-center justify-center">
                {s.hero_image_url ? (
                  <img src={s.hero_image_url} alt="Hero" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="text-center">
                    <Leaf className="h-24 w-24 text-primary mx-auto" strokeWidth={0.75} />
                    <p className="font-heading text-2xl text-primary mt-4">Pure · Natural · Sacred</p>
                  </div>
                )}
              </div>
              <span className="absolute -top-4 -right-4 h-24 w-24 rounded-full border border-accent/40" />
              <span className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full border border-primary/30" />
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="border-y border-border bg-secondary/30">
          <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Leaf, t: "100% Natural", d: "No parabens or sulphates" },
              { icon: Sparkles, t: "Small Batch", d: "Handcrafted with care" },
              { icon: Heart, t: "Cruelty Free", d: "Kind to every soul" },
              { icon: Truck, t: "Free Shipping", d: `On orders above ${s.currency_symbol}${s.free_shipping_threshold}` },
            ].map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <v.icon className="h-6 w-6 text-primary" strokeWidth={1.25} />
                <div className="font-heading text-sm">{v.t}</div>
                <div className="text-xs text-muted-foreground">{v.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="container-page py-16">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Collections</p>
            <h2 className="font-heading text-4xl mt-2">Shop by Category</h2>
            <div className="ornament my-4 max-w-xs mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((c) => (
              <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className="card-elegant p-8 text-center hover:border-primary transition-colors">
                <Leaf className="h-8 w-8 mx-auto text-primary" strokeWidth={1} />
                <div className="font-heading text-lg mt-3">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED */}
        <section className="container-page py-16">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Bestsellers</p>
            <h2 className="font-heading text-4xl mt-2">Signature Soaps</h2>
            <div className="ornament my-4 max-w-xs mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured?.map((p) => <ProductCard key={p.id} p={p} symbol={s.currency_symbol} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/shop" className="btn-outline">View All Soaps</Link>
          </div>
        </section>

        {/* STORY */}
        <section className="bg-primary/5 py-20">
          <div className="container-page max-w-3xl text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Our Craft</p>
            <h2 className="font-heading text-4xl mt-2">Rooted in Tradition</h2>
            <div className="ornament my-6 max-w-xs mx-auto" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every bar is a small ceremony — cold-pressed oils, herbs harvested at their peak, and recipes
              passed through generations. We believe skincare is a ritual, not a routine.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
