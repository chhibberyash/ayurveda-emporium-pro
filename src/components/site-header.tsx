import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Heart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { useSiteSettings } from "@/lib/settings";

export function SiteHeader() {
  const { count } = useCart();
  const { user, isAdmin, signOut } = useSession();
  const settings = useSiteSettings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q } as any });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/85 border-b border-border">
      <div className="container-page flex h-16 items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name} className="h-9 w-9 object-contain" />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 font-heading text-lg text-primary">
              ॐ
            </span>
          )}
          <span className="font-heading text-xl tracking-tight text-foreground">{settings.site_name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="text-foreground/80 hover:text-foreground">Home</Link>
          <Link to="/shop" className="text-foreground/80 hover:text-foreground">Shop</Link>
          <Link to="/pages/$slug" params={{ slug: "about" }} className="text-foreground/80 hover:text-foreground">About</Link>
          <Link to="/contact" className="text-foreground/80 hover:text-foreground">Contact</Link>
        </nav>
        <form onSubmit={submit} className="ml-auto hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search soaps..."
              className="pl-9 pr-3 py-2 w-56 rounded-full border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </form>
        <div className="flex items-center gap-2">
          <Link to="/wishlist" className="p-2 hover:text-primary" aria-label="Wishlist"><Heart className="h-5 w-5" /></Link>
          <Link to="/cart" className="relative p-2 hover:text-primary" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              {isAdmin && <Link to="/admin" className="btn-outline text-xs px-3 py-1.5">Admin</Link>}
              <Link to="/account" className="p-2 hover:text-primary" aria-label="Account"><User className="h-5 w-5" /></Link>
              <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary hover:bg-primary/90 ml-2 text-xs">Sign in</Link>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-page py-4 flex flex-col gap-3 text-sm">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/shop" onClick={() => setOpen(false)}>Shop</Link>
            <Link to="/pages/$slug" params={{ slug: "about" }} onClick={() => setOpen(false)}>About</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
            {user && <Link to="/account" onClick={() => setOpen(false)}>My Account</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
            <form onSubmit={submit} className="mt-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 rounded border border-input bg-background" />
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
