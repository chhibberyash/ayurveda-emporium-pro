import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  currency_symbol: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  footer_text: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  shipping_flat_rate: number;
  free_shipping_threshold: number;
  address: string | null;
};

export type ThemeSettings = {
  primary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  radius: string;
  heading_font: string;
  body_font: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Amrita Ayurveda",
  tagline: "Handcrafted Ayurvedic soaps",
  logo_url: null,
  contact_email: "hello@example.com",
  contact_phone: "",
  currency_symbol: "₹",
  hero_title: "Purity in every lather",
  hero_subtitle: "Ancient recipes, gentle on skin, honest ingredients.",
  hero_image_url: null,
  footer_text: null,
  social_instagram: null,
  social_facebook: null,
  shipping_flat_rate: 49,
  free_shipping_threshold: 999,
  address: null,
};

// Simple hex → oklch: apply as raw CSS custom prop; browsers accept hex in var().
function applyTheme(t: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", t.primary_color);
  root.style.setProperty("--accent", t.accent_color);
  root.style.setProperty("--background", t.background_color);
  root.style.setProperty("--foreground", t.foreground_color);
  root.style.setProperty("--radius", t.radius);
  root.style.setProperty("--heading-font", `"${t.heading_font}"`);
  root.style.setProperty("--body-font", `"${t.body_font}"`);
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...(data as Partial<SiteSettings>) });
      });
  }, []);
  return settings;
}

export function useThemeApplier() {
  useEffect(() => {
    supabase
      .from("theme_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) applyTheme(data as ThemeSettings);
      });
  }, []);
}
