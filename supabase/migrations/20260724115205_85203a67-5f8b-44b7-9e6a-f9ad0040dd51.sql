
-- ============= ROLES =============
create type public.app_role as enum ('admin','customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============= PROFILES =============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "admins update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============= SIGNUP TRIGGER: profile + admin auto-grant =============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
    on conflict do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  if lower(new.email) = 'yashchhibber99@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- also promote on email confirmation (in case user existed before)
create or replace function public.promote_admin_on_confirm()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if lower(new.email) = 'yashchhibber99@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.promote_admin_on_confirm();

-- ============= CATEGORIES =============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============= PRODUCTS =============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  ingredients text,
  benefits text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  stock int not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  images jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products(category_id);
create index on public.products(active);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select using (true);
create policy "admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============= COUPONS =============
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null,
  min_order numeric(10,2) not null default 0,
  usage_limit int,
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon, authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "public read active coupons" on public.coupons for select using (active = true);
create policy "admins manage coupons" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============= ADDRESSES =============
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins read addresses" on public.addresses for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============= ORDERS =============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-'||to_char(now(),'YYYYMMDD')||'-'||substr(gen_random_uuid()::text,1,6)),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  payment_method text,
  payment_status text not null default 'pending',
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders(user_id);
create index on public.orders(status);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "insert own orders" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "admins read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity int not null,
  image_url text,
  created_at timestamptz not null default now()
);
create index on public.order_items(order_id);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "insert own order items" on public.order_items for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admins read all order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============= WISHLIST =============
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy "own wishlist" on public.wishlists for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============= SITE SETTINGS (singleton) =============
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Amrita Ayurveda',
  tagline text not null default 'Handcrafted Ayurvedic soaps, rooted in tradition',
  logo_url text,
  contact_email text not null default 'hello@example.com',
  contact_phone text not null default '',
  address text default '',
  currency text not null default 'INR',
  currency_symbol text not null default '₹',
  social_instagram text default '',
  social_facebook text default '',
  social_twitter text default '',
  footer_text text default '',
  hero_title text default 'Purity in every lather',
  hero_subtitle text default 'Ancient recipes, gentle on skin, honest ingredients.',
  hero_image_url text,
  about_snippet text default '',
  shipping_flat_rate numeric(10,2) not null default 49,
  free_shipping_threshold numeric(10,2) not null default 999,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select using (true);
create policy "admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============= THEME SETTINGS (singleton) =============
create table public.theme_settings (
  id int primary key default 1 check (id = 1),
  primary_color text not null default '#2f4a3a',
  accent_color text not null default '#b08b3f',
  background_color text not null default '#faf6ef',
  foreground_color text not null default '#1c1917',
  radius text not null default '0.5rem',
  heading_font text not null default 'Cormorant Garamond',
  body_font text not null default 'Inter',
  updated_at timestamptz not null default now()
);
insert into public.theme_settings (id) values (1) on conflict do nothing;
grant select on public.theme_settings to anon, authenticated;
grant update on public.theme_settings to authenticated;
grant all on public.theme_settings to service_role;
alter table public.theme_settings enable row level security;
create policy "public read theme" on public.theme_settings for select using (true);
create policy "admins update theme" on public.theme_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============= PAYMENT GATEWAY SLOTS =============
create table public.payment_gateways (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  display_name text not null,
  enabled boolean not null default false,
  mode text not null default 'test',
  public_key text default '',
  config jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.payment_gateways to anon, authenticated;
grant insert, update, delete on public.payment_gateways to authenticated;
grant all on public.payment_gateways to service_role;
alter table public.payment_gateways enable row level security;
create policy "public read gateways" on public.payment_gateways for select using (true);
create policy "admins manage gateways" on public.payment_gateways for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.payment_gateways (provider, display_name, mode, sort_order) values
  ('razorpay','Razorpay','test',1),
  ('stripe','Stripe','test',2),
  ('paypal','PayPal','test',3),
  ('cod','Cash on Delivery','live',4),
  ('phone_otp','Phone OTP / SMS (Twilio)','test',99)
  on conflict do nothing;

-- ============= CMS PAGES =============
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "public read published pages" on public.pages for select using (published = true);
create policy "admins read all pages" on public.pages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage pages" on public.pages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.pages (slug,title,content) values
  ('about','About Us','<p>Amrita Ayurveda crafts small-batch soaps using time-honored recipes and locally sourced botanicals.</p>'),
  ('shipping','Shipping & Returns','<p>We ship pan-India within 3-7 business days. Free shipping on orders above ₹999.</p>'),
  ('privacy','Privacy Policy','<p>We respect your privacy. Your data is used solely to fulfill your orders.</p>'),
  ('terms','Terms of Service','<p>By using this site you agree to our terms.</p>')
  on conflict do nothing;

-- ============= CHAT =============
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  guest_email text,
  subject text default 'Contact',
  status text not null default 'open' check (status in ('open','closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.chat_threads to authenticated;
grant select, insert on public.chat_threads to anon;
grant all on public.chat_threads to service_role;
alter table public.chat_threads enable row level security;
create policy "own threads" on public.chat_threads for select to authenticated using (user_id = auth.uid());
create policy "insert own threads" on public.chat_threads for insert to authenticated with check (user_id = auth.uid() or user_id is null);
create policy "guest insert threads" on public.chat_threads for insert to anon with check (user_id is null);
create policy "admins read all threads" on public.chat_threads for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update threads" on public.chat_threads for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('user','admin','guest')),
  sender_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);
create index on public.chat_messages(thread_id);
grant select, insert on public.chat_messages to authenticated, anon;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "read own thread messages" on public.chat_messages for select to authenticated using (exists (select 1 from public.chat_threads t where t.id = thread_id and (t.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "insert own thread messages" on public.chat_messages for insert to authenticated with check (exists (select 1 from public.chat_threads t where t.id = thread_id and (t.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "guest read thread messages" on public.chat_messages for select to anon using (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id is null));
create policy "guest insert thread messages" on public.chat_messages for insert to anon with check (exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id is null));

-- ============= SEED CATEGORIES + PRODUCTS =============
insert into public.categories (name, slug, description, sort_order) values
  ('Herbal','herbal','Classic herbal blends',1),
  ('Floral','floral','Delicate floral notes',2),
  ('Detox','detox','Deep cleansing formulations',3),
  ('Gift Sets','gift-sets','Curated gift boxes',4)
  on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, compare_at_price, stock, category_id, featured, image_url, tags)
select 'Neem & Tulsi Purifying Bar','neem-tulsi','Antibacterial daily cleanser','Handmade with cold-pressed oils, neem leaf and holy basil for clarifying skin.','Neem oil, Tulsi extract, Coconut oil, Shea butter, Essential oils','Purifies, soothes acne, clarifies',249,299,45,c.id,true,null,array['bestseller','herbal']
from public.categories c where c.slug='herbal' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, featured, tags)
select 'Sandalwood Rose Bar','sandalwood-rose','Luxurious floral bar','Rose petals steeped in sandalwood oil for a soft glow.','Sandalwood oil, Rose extract, Goat milk, Olive oil','Brightens, softens, calms',329,30,c.id,true,array['floral','luxury']
from public.categories c where c.slug='floral' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, tags)
select 'Charcoal Detox Bar','charcoal-detox','Deep-pore detox','Activated charcoal draws out impurities.','Activated charcoal, Tea tree, Coconut oil','Deep clean, oil control',289,40,c.id,array['detox']
from public.categories c where c.slug='detox' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, tags)
select 'Turmeric Saffron Glow Bar','turmeric-saffron','Radiance ritual','Ayurvedic golden bar for glowing skin.','Turmeric, Saffron, Milk cream, Almond oil','Glow, even tone',349,25,c.id,array['bestseller']
from public.categories c where c.slug='herbal' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, tags)
select 'Aloe Vera Freshness','aloe-vera-freshness','Cooling daily bar','Fresh aloe pulp for sensitive skin.','Aloe vera, Cucumber, Mint','Cools, hydrates',229,60,c.id,array['sensitive']
from public.categories c where c.slug='herbal' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, tags)
select 'Jasmine Milk Bar','jasmine-milk','Silken floral','Fresh jasmine flowers in raw milk base.','Jasmine oil, Raw milk, Honey','Softens, nourishes',309,20,c.id,array['floral']
from public.categories c where c.slug='floral' on conflict do nothing;

insert into public.products (name, slug, short_description, description, ingredients, benefits, price, stock, category_id, tags)
select 'Ayurveda Trio Gift Box','ayurveda-trio','Three signature bars','Neem-Tulsi, Sandalwood-Rose and Turmeric-Saffron in a handcrafted box.','Assorted','Perfect gift',899,15,c.id,array['gift']
from public.categories c where c.slug='gift-sets' on conflict do nothing;

-- ============= SAMPLE COUPON =============
insert into public.coupons (code, discount_type, discount_value, min_order) values ('WELCOME10','percent',10,499) on conflict do nothing;
