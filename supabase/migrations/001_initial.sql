-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Users table
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  phone text,
  email text not null,
  role text not null check (role in ('client', 'rider', 'merchant')),
  address text,
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Merchants table
create table public.merchants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  description text,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  is_open boolean default false not null,
  delivery_fee numeric(10, 2) default 1.50 not null,
  min_order numeric(10, 2) default 10.00 not null,
  logo_url text,
  created_at timestamptz default now() not null
);

alter table public.merchants enable row level security;

create policy "Merchants are publicly viewable"
  on public.merchants for select
  using (true);

create policy "Merchants can update own record"
  on public.merchants for update
  using (auth.uid() = user_id);

-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  merchant_id uuid references public.merchants(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  category text not null,
  image_url text,
  available boolean default true not null,
  created_at timestamptz default now() not null
);

alter table public.products enable row level security;

create policy "Products are publicly viewable"
  on public.products for select
  using (true);

create policy "Merchants can manage own products"
  on public.products for all
  using (
    exists (
      select 1 from public.merchants m
      where m.id = merchant_id and m.user_id = auth.uid()
    )
  );

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.users(id) not null,
  merchant_id uuid references public.merchants(id) not null,
  rider_id uuid references public.users(id),
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'cancelled')
  ),
  total numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null,
  address text not null,
  lat double precision,
  lng double precision,
  notes text,
  payment_method text not null default 'card' check (payment_method in ('card', 'cash')),
  stripe_payment_intent_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.orders enable row level security;

create policy "Clients can view own orders"
  on public.orders for select
  using (auth.uid() = client_id);

create policy "Merchants can view their orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.merchants m
      where m.id = merchant_id and m.user_id = auth.uid()
    )
  );

create policy "Riders can view assigned orders"
  on public.orders for select
  using (auth.uid() = rider_id);

create policy "Clients can create orders"
  on public.orders for insert
  with check (auth.uid() = client_id);

create policy "Merchants can update order status"
  on public.orders for update
  using (
    exists (
      select 1 from public.merchants m
      where m.id = merchant_id and m.user_id = auth.uid()
    )
  );

create policy "Riders can update assigned orders"
  on public.orders for update
  using (auth.uid() = rider_id);

-- Order items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null,
  created_at timestamptz default now() not null
);

alter table public.order_items enable row level security;

create policy "Order items visible to order participants"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.client_id = auth.uid()
          or o.rider_id = auth.uid()
          or exists (
            select 1 from public.merchants m
            where m.id = o.merchant_id and m.user_id = auth.uid()
          )
        )
    )
  );

create policy "Clients can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.client_id = auth.uid()
    )
  );

-- Rider locations table
create table public.rider_locations (
  rider_id uuid references public.users(id) on delete cascade primary key,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz default now() not null
);

alter table public.rider_locations enable row level security;

create policy "Rider locations visible to authenticated users"
  on public.rider_locations for select
  using (auth.role() = 'authenticated');

create policy "Riders can update own location"
  on public.rider_locations for all
  using (auth.uid() = rider_id);

-- Enable realtime for orders and rider_locations
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.rider_locations;

-- Trigger to update orders.updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function update_updated_at();

-- Function to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
