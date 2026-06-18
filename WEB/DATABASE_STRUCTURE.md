# Tour Booking System - Database Structure

This document outlines the complete database schema for the Sri Lanka Tour Booking System.

## Tables Overview

1. **profiles** - User profiles
2. **tours** - Tour packages
3. **tour_images** - Tour gallery images
4. **itinerary_days** - Daily itinerary for tours
5. **itinerary_stops** - Stops/locations for each day
6. **bookings** - Tour bookings
7. **payments** - Payment records
8. **reviews** - Tour reviews

---

## 1. profiles

User profiles linked to Supabase Auth users.

```sql
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  full_name text,
  phone text,
  country text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  primary key (id)
);

alter table public.profiles enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Example Data
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "country": "United States",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

## 2. tours

Main tour packages table.

```sql
create table public.tours (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  location text not null,
  duration text not null,
  price decimal(10,2) not null,
  rating decimal(3,2) default 0,
  reviews_count int default 0,
  description text not null,
  main_image text,
  map_embed text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tours enable row level security;

-- RLS Policies
create policy "Anyone can view active tours"
  on tours for select
  using (is_active = true);

create policy "Only authenticated users can create tours"
  on tours for insert
  with check (auth.role() = 'authenticated');

create policy "Only authenticated users can update tours"
  on tours for update
  using (auth.role() = 'authenticated');
```

### Example Data
```json
{
  "id": 1,
  "name": "4 Days Sri Lanka Round Tour",
  "category": "Adventure",
  "location": "Sri Lanka",
  "duration": "4 Days 3 Nights",
  "price": 899.00,
  "rating": 4.9,
  "reviews_count": 156,
  "description": "Experience the best of Sri Lanka in 4 unforgettable days...",
  "main_image": "/images/tours/sigiriya.jpg",
  "map_embed": "https://www.google.com/maps/embed?pb=...",
  "is_active": true,
  "created_at": "2025-01-10T08:00:00Z",
  "updated_at": "2025-01-10T08:00:00Z"
}
```

---

## 3. tour_images

Gallery images for each tour.

```sql
create table public.tour_images (
  id bigint generated always as identity primary key,
  tour_id bigint not null references tours(id) on delete cascade,
  image_url text not null,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

alter table public.tour_images enable row level security;

-- RLS Policies
create policy "Anyone can view tour images"
  on tour_images for select
  using (true);

create policy "Only authenticated users can manage tour images"
  on tour_images for all
  using (auth.role() = 'authenticated');
```

### Example Data
```json
{
  "id": 1,
  "tour_id": 1,
  "image_url": "/images/tours/sigiriya-1.jpg",
  "display_order": 0,
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

## 4. tour_highlights

Tour highlights and features.

```sql
create table public.tour_highlights (
  id bigint generated always as identity primary key,
  tour_id bigint not null references tours(id) on delete cascade,
  highlight text not null,
  display_order int default 0
);

alter table public.tour_highlights enable row level security;

create policy "Anyone can view tour highlights"
  on tour_highlights for select
  using (true);
```

### Example Data
```json
{
  "id": 1,
  "tour_id": 1,
  "highlight": "Visit the iconic Sigiriya Rock Fortress",
  "display_order": 0
}
```

---

## 5. tour_inclusions

What's included in the tour package.

```sql
create table public.tour_inclusions (
  id bigint generated always as identity primary key,
  tour_id bigint not null references tours(id) on delete cascade,
  inclusion text not null,
  display_order int default 0
);

alter table public.tour_inclusions enable row level security;

create policy "Anyone can view tour inclusions"
  on tour_inclusions for select
  using (true);
```

### Example Data
```json
{
  "id": 1,
  "tour_id": 1,
  "inclusion": "Accommodation for 3 nights",
  "display_order": 0
}
```

---

## 6. itinerary_days

Daily itinerary for multi-day tours.

```sql
create table public.itinerary_days (
  id bigint generated always as identity primary key,
  tour_id bigint not null references tours(id) on delete cascade,
  day_number int not null,
  title text not null,
  meals jsonb default '[]'::jsonb, -- ["Breakfast", "Lunch", "Dinner"]
  accommodation text,
  created_at timestamp with time zone default now(),
  
  unique(tour_id, day_number)
);

alter table public.itinerary_days enable row level security;

-- RLS Policies
create policy "Anyone can view itinerary days"
  on itinerary_days for select
  using (true);

create policy "Only authenticated users can manage itinerary days"
  on itinerary_days for all
  using (auth.role() = 'authenticated');
```

### Example Data
```json
{
  "id": 1,
  "tour_id": 1,
  "day_number": 1,
  "title": "Colombo Airport to Sigiriya via Dambulla",
  "meals": ["Lunch", "Dinner"],
  "accommodation": "Hotel Sigiriya (4-star or similar)",
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

## 7. itinerary_stops

Stops/locations for each day of the itinerary.

```sql
create table public.itinerary_stops (
  id bigint generated always as identity primary key,
  itinerary_day_id bigint not null references itinerary_days(id) on delete cascade,
  stop_order int not null,
  name text not null,
  description text,
  duration text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  admission_included boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.itinerary_stops enable row level security;

-- RLS Policies
create policy "Anyone can view itinerary stops"
  on itinerary_stops for select
  using (true);

create policy "Only authenticated users can manage itinerary stops"
  on itinerary_stops for all
  using (auth.role() = 'authenticated');
```

### Example Data
```json
{
  "id": 1,
  "itinerary_day_id": 1,
  "stop_order": 1,
  "name": "Bandaranaike International Airport",
  "description": "Pick up from airport and begin journey",
  "duration": "30 mins",
  "latitude": 7.1807600,
  "longitude": 79.8839700,
  "admission_included": false,
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

## 8. bookings

Tour booking records.

```sql
create table public.bookings (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  tour_id bigint not null references tours(id) on delete restrict,
  booking_date date not null,
  number_of_people int not null check (number_of_people > 0),
  total_price decimal(10,2) not null,
  status text not null default 'pending', -- pending, confirmed, cancelled, completed
  special_requests text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.bookings enable row level security;

-- RLS Policies
create policy "Users can view own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "Users can create bookings"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on bookings for update
  using (auth.uid() = user_id);
```

### Example Data
```json
{
  "id": 1,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "tour_id": 1,
  "booking_date": "2025-02-15",
  "number_of_people": 2,
  "total_price": 1798.00,
  "status": "confirmed",
  "special_requests": "Vegetarian meals preferred",
  "contact_name": "John Doe",
  "contact_email": "john.doe@example.com",
  "contact_phone": "+1234567890",
  "created_at": "2025-01-15T14:30:00Z",
  "updated_at": "2025-01-15T14:30:00Z"
}
```

---

## 9. payments

Payment transaction records.

```sql
create table public.payments (
  id bigint generated always as identity primary key,
  booking_id bigint not null references bookings(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  amount decimal(10,2) not null,
  currency text default 'USD',
  payment_method text not null, -- stripe, paypal, etc.
  transaction_id text unique,
  status text not null default 'pending', -- pending, completed, failed, refunded
  stripe_payment_intent_id text,
  card_last4 text,
  card_brand text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.payments enable row level security;

-- RLS Policies
create policy "Users can view own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can create payments"
  on payments for insert
  with check (auth.uid() = user_id);
```

### Example Data
```json
{
  "id": 1,
  "booking_id": 1,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 1798.00,
  "currency": "USD",
  "payment_method": "stripe",
  "transaction_id": "txn_1234567890",
  "status": "completed",
  "stripe_payment_intent_id": "pi_1234567890",
  "card_last4": "4242",
  "card_brand": "visa",
  "paid_at": "2025-01-15T14:35:00Z",
  "created_at": "2025-01-15T14:35:00Z",
  "updated_at": "2025-01-15T14:35:00Z"
}
```

---

## 10. reviews

Tour reviews and ratings.

```sql
create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  tour_id bigint not null references tours(id) on delete cascade,
  booking_id bigint references bookings(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  is_verified boolean default false, -- verified if user actually booked the tour
  is_approved boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, tour_id) -- One review per user per tour
);

alter table public.reviews enable row level security;

-- RLS Policies
create policy "Anyone can view approved reviews"
  on reviews for select
  using (is_approved = true);

create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);
```

### Example Data
```json
{
  "id": 1,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "tour_id": 1,
  "booking_id": 1,
  "rating": 5,
  "title": "Amazing Experience!",
  "comment": "The 4-day tour was absolutely incredible. Our guide was knowledgeable and friendly. Highly recommended!",
  "is_verified": true,
  "is_approved": true,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

---

## Database Functions & Triggers

### 1. Update tour rating when reviews are added

```sql
create or replace function update_tour_rating()
returns trigger as $$
begin
  update tours
  set 
    rating = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where tour_id = NEW.tour_id and is_approved = true
    ),
    reviews_count = (
      select count(*)
      from reviews
      where tour_id = NEW.tour_id and is_approved = true
    ),
    updated_at = now()
  where id = NEW.tour_id;
  
  return NEW;
end;
$$ language plpgsql;

create trigger on_review_created
  after insert or update on reviews
  for each row
  execute function update_tour_rating();
```

### 2. Update timestamps automatically

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

create trigger update_tours_updated_at
  before update on tours
  for each row
  execute function update_updated_at();

create trigger update_bookings_updated_at
  before update on bookings
  for each row
  execute function update_updated_at();

create trigger update_payments_updated_at
  before update on payments
  for each row
  execute function update_updated_at();
```

---

## Indexes for Performance

```sql
-- Tours
create index idx_tours_category on tours(category);
create index idx_tours_location on tours(location);
create index idx_tours_is_active on tours(is_active);

-- Bookings
create index idx_bookings_user_id on bookings(user_id);
create index idx_bookings_tour_id on bookings(tour_id);
create index idx_bookings_booking_date on bookings(booking_date);
create index idx_bookings_status on bookings(status);

-- Payments
create index idx_payments_user_id on payments(user_id);
create index idx_payments_booking_id on payments(booking_id);
create index idx_payments_status on payments(status);
create index idx_payments_transaction_id on payments(transaction_id);

-- Reviews
create index idx_reviews_tour_id on reviews(tour_id);
create index idx_reviews_user_id on reviews(user_id);
create index idx_reviews_is_approved on reviews(is_approved);

-- Itinerary
create index idx_itinerary_days_tour_id on itinerary_days(tour_id);
create index idx_itinerary_stops_day_id on itinerary_stops(itinerary_day_id);
```

---

## Sample Query Examples

### Get tour with full details

```sql
select 
  t.*,
  json_agg(distinct ti.*) as images,
  json_agg(distinct th.*) as highlights,
  json_agg(distinct tin.*) as inclusions,
  (
    select json_agg(
      json_build_object(
        'day_number', id.day_number,
        'title', id.title,
        'meals', id.meals,
        'accommodation', id.accommodation,
        'stops', (
          select json_agg(
            json_build_object(
              'order', ist.stop_order,
              'name', ist.name,
              'description', ist.description,
              'duration', ist.duration,
              'lat', ist.latitude,
              'lng', ist.longitude,
              'admission_included', ist.admission_included
            ) order by ist.stop_order
          )
          from itinerary_stops ist
          where ist.itinerary_day_id = id.id
        )
      ) order by id.day_number
    )
    from itinerary_days id
    where id.tour_id = t.id
  ) as itinerary
from tours t
left join tour_images ti on ti.tour_id = t.id
left join tour_highlights th on th.tour_id = t.id
left join tour_inclusions tin on tin.tour_id = t.id
where t.id = 1
group by t.id;
```

### Get user's bookings with tour details

```sql
select 
  b.*,
  t.name as tour_name,
  t.main_image,
  p.status as payment_status,
  p.amount as payment_amount
from bookings b
join tours t on t.id = b.tour_id
left join payments p on p.booking_id = b.id
where b.user_id = '123e4567-e89b-12d3-a456-426614174000'
order by b.created_at desc;
```

---

This database structure provides a complete foundation for a tour booking system with user profiles, tours, itineraries with map coordinates, bookings, payments, and reviews.
