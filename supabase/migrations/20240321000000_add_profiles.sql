-- Create profiles table that extends auth.users
create table if not exists profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    first_name text,
    last_name text,
    avatar_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on profiles for insert
    with check (auth.uid() = id);

-- Create a trigger to create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 