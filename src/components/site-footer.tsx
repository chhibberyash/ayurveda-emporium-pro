import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/settings";
import { Instagram, Facebook } from "lucide-react";

export function SiteFooter() {
  const s = useSiteSettings();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 font-heading text-primary">ॐ</span>
            <span className="font-heading text-lg">{s.site_name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{s.tagline}</p>
        </div>
        <div>
          <h4 className="font-heading text-sm mb-3 tracking-wide uppercase">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All Soaps</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "shipping" }} className="hover:text-foreground">Shipping</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "terms" }} className="hover:text-foreground">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm mb-3 tracking-wide uppercase">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pages/$slug" params={{ slug: "about" }} className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "privacy" }} className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm mb-3 tracking-wide uppercase">Get in touch</h4>
          <p className="text-sm text-muted-foreground">{s.contact_email}</p>
          {s.contact_phone && <p className="text-sm text-muted-foreground">{s.contact_phone}</p>}
          <div className="flex gap-3 mt-3">
            {s.social_instagram && <a href={s.social_instagram} className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>}
            {s.social_facebook && <a href={s.social_facebook} className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>{s.footer_text || `© ${new Date().getFullYear()} ${s.site_name}. All rights reserved.`}</span>
          <span>Crafted with care · Made in India</span>
        </div>
      </div>
    </footer>
  );
}
