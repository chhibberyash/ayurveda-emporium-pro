import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Sparkles, Heart, Truck, Star, Quote, ShieldCheck, Flower2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/settings";
import heroSoap from "@/assets/hero-soap.jpg";

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
          {/* soft floating decorative herbs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <Flower2 className="absolute top-16 left-8 h-10 w-10 text-primary/20 animate-float" strokeWidth={1} />
            <Leaf className="absolute top-1/3 right-10 h-14 w-14 text-accent/25 animate-float-slower" strokeWidth={1} />
            <Leaf className="absolute bottom-20 left-1/4 h-8 w-8 text-primary/25 animate-float" style={{ animationDelay: "1.5s" }} strokeWidth={1} />
            <Flower2 className="absolute bottom-16 right-1/4 h-9 w-9 text-accent/25 animate-float-slower" style={{ animationDelay: "2s" }} strokeWidth={1} />
          </div>

          <div className="container-page py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4 animate-fade-in-slow">— Since Ancient Times —</p>
              <h1 className="font-heading text-5xl md:text-7xl leading-[1.05] text-foreground">
                {s.hero_title}
              </h1>
              <div className="ornament my-6 max-w-xs" />
              <p className="text-lg text-muted-foreground max-w-md">{s.hero_subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="btn-primary hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg">Explore the Collection</Link>
                <Link to="/pages/$slug" params={{ slug: "about" }} className="btn-outline hover:-translate-y-0.5 transition-transform">Our Story</Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="font-medium text-foreground">4.9</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>Loved by 2,000+ souls</div>
              </div>
            </div>

            <div className="relative animate-fade-in-slow">
              {/* soft glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/25 to-primary/15 blur-2xl scale-95" />
              {/* main image with breathing tilt */}
              <div className="relative aspect-square rounded-full overflow-hidden shadow-2xl animate-tilt-breath ring-1 ring-accent/20">
                <img
                  src={s.hero_image_url || heroSoap}
                  alt="Handcrafted ayurvedic soap with fresh neem, turmeric and aloe vera on a wooden tray"
                  className="w-full h-full object-cover"
                  width={1200}
                  height={1200}
                />
                {/* steam wisps */}
                <div className="pointer-events-none absolute top-6 left-1/3 h-16 w-10 bg-gradient-to-t from-white/0 via-white/30 to-white/0 blur-xl animate-steam" />
                <div className="pointer-events-none absolute top-10 left-1/2 h-20 w-8 bg-gradient-to-t from-white/0 via-white/25 to-white/0 blur-xl animate-steam" style={{ animationDelay: "1.5s" }} />
                {/* golden sunlight overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,220,150,0.25),transparent_55%)]" />
              </div>
              {/* orbiting decorations */}
              <span className="absolute -top-4 -right-4 h-24 w-24 rounded-full border border-accent/40 animate-float" />
              <span className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full border border-primary/30 animate-float-slower" />
              {/* floating badge */}
              <div className="absolute -left-4 top-1/4 card-elegant px-4 py-2 flex items-center gap-2 animate-float">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">100% Herbal</span>
              </div>
              <div className="absolute -right-2 bottom-1/4 card-elegant px-4 py-2 flex items-center gap-2 animate-float-slower">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium">Cold-Pressed</span>
              </div>
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
              <div key={i} className="flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 duration-300">
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
            {categories?.map((c, i) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug } as any}
                className="card-elegant p-8 text-center hover:border-primary transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Leaf className="h-8 w-8 mx-auto text-primary transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" strokeWidth={1} />
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
            <Link to="/shop" className="btn-outline hover:-translate-y-0.5 transition-transform">View All Soaps</Link>
          </div>
        </section>

        {/* STORY WITH IMAGE */}
        <section className="bg-primary/5 py-20 overflow-hidden">
          <div className="container-page grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src={heroSoap}
                alt="Ayurvedic soap making process"
                className="rounded-lg shadow-xl w-full object-cover aspect-[4/5]"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -right-6 card-elegant p-6 max-w-[200px] hidden md:block animate-float">
                <div className="font-heading text-3xl text-primary">15+</div>
                <div className="text-xs text-muted-foreground mt-1">Years of ayurvedic craft</div>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent">Our Craft</p>
              <h2 className="font-heading text-4xl mt-2">Rooted in Tradition</h2>
              <div className="ornament my-6 max-w-xs" />
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every bar is a small ceremony — cold-pressed oils, herbs harvested at their peak, and recipes
                passed through generations. We believe skincare is a ritual, not a routine.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Flower2, t: "Wild-harvested herbs" },
                  { icon: Sparkles, t: "Cold-pressed oils" },
                  { icon: ShieldCheck, t: "No harsh chemicals" },
                  { icon: Heart, t: "Made with love" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 card-elegant hover:-translate-y-1 transition-transform">
                    <f.icon className="h-5 w-5 text-primary shrink-0" strokeWidth={1.25} />
                    <span className="text-sm">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container-page py-20">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Kind Words</p>
            <h2 className="font-heading text-4xl mt-2">Loved by our community</h2>
            <div className="ornament my-4 max-w-xs mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Ananya S.", r: "The neem-tulsi bar cleared my skin in weeks. It smells like a garden.", loc: "Mumbai" },
              { n: "Rohan K.", r: "Feels like a spa ritual every morning. Beautifully packaged too.", loc: "Bengaluru" },
              { n: "Priya M.", r: "My grandmother used to make soaps this way. Pure nostalgia.", loc: "Delhi" },
            ].map((t, i) => (
              <div key={i} className="card-elegant p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-accent/20" />
                <div className="flex text-accent mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{t.r}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-heading text-sm">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.loc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container-page max-w-2xl text-center">
            <Flower2 className="h-10 w-10 mx-auto text-primary animate-float" strokeWidth={1} />
            <h2 className="font-heading text-3xl md:text-4xl mt-4">Join the Ritual</h2>
            <p className="text-muted-foreground mt-3">Seasonal drops, ancient recipes, and 10% off your first order.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" className="btn-primary hover:bg-primary/90 hover:-translate-y-0.5">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
