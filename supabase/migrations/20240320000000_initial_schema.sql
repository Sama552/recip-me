-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create recipes table
create table if not exists recipes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    description text,
    prep_time interval,
    cook_time interval,
    servings integer check (servings > 0),
    source_url text,
    source_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ingredients table
create table if not exists ingredients (
    id uuid default gen_random_uuid() primary key,
    recipe_id uuid references recipes(id) on delete cascade not null,
    name text not null,
    amount decimal check (amount > 0),
    unit text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create instructions table
create table if not exists instructions (
    id uuid default gen_random_uuid() primary key,
    recipe_id uuid references recipes(id) on delete cascade not null,
    step_number integer not null check (step_number > 0),
    description text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Ensure unique step numbers per recipe
    unique(recipe_id, step_number)
);

-- Create tags table
create table if not exists tags (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create recipe_tags junction table
create table if not exists recipe_tags (
    recipe_id uuid references recipes(id) on delete cascade,
    tag_id uuid references tags(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (recipe_id, tag_id)
);

-- Create indexes for better query performance
create index if not exists idx_recipes_user_id on recipes(user_id);
create index if not exists idx_ingredients_recipe_id on ingredients(recipe_id);
create index if not exists idx_instructions_recipe_id on instructions(recipe_id);
create index if not exists idx_tags_name on tags(name);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for recipes table
create trigger update_recipes_updated_at
    before update on recipes
    for each row
    execute function update_updated_at_column();

-- Add RLS (Row Level Security) policies
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table instructions enable row level security;
alter table tags enable row level security;
alter table recipe_tags enable row level security;

-- Create policies
create policy "Users can view their own recipes"
    on recipes for select
    using (auth.uid() = user_id);

create policy "Users can insert their own recipes"
    on recipes for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
    on recipes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
    on recipes for delete
    using (auth.uid() = user_id);

-- Similar policies for related tables
create policy "Users can view ingredients of their recipes"
    on ingredients for select
    using (exists (
        select 1 from recipes
        where recipes.id = ingredients.recipe_id
        and recipes.user_id = auth.uid()
    ));

create policy "Users can modify ingredients of their recipes"
    on ingredients for all
    using (exists (
        select 1 from recipes
        where recipes.id = ingredients.recipe_id
        and recipes.user_id = auth.uid()
    ));

-- Similar policies for instructions
create policy "Users can view instructions of their recipes"
    on instructions for select
    using (exists (
        select 1 from recipes
        where recipes.id = instructions.recipe_id
        and recipes.user_id = auth.uid()
    ));

create policy "Users can modify instructions of their recipes"
    on instructions for all
    using (exists (
        select 1 from recipes
        where recipes.id = instructions.recipe_id
        and recipes.user_id = auth.uid()
    ));

-- Tags are public but can only be modified by recipe owners
create policy "Everyone can view tags"
    on tags for select
    to public;

create policy "Users can create tags when they own the recipe"
    on tags for insert
    with check (true);  -- We'll control this through the application logic

-- Recipe tags policies
create policy "Users can view recipe tags"
    on recipe_tags for select
    using (exists (
        select 1 from recipes
        where recipes.id = recipe_tags.recipe_id
        and recipes.user_id = auth.uid()
    ));

create policy "Users can modify recipe tags of their recipes"
    on recipe_tags for all
    using (exists (
        select 1 from recipes
        where recipes.id = recipe_tags.recipe_id
        and recipes.user_id = auth.uid()
    ));

-- Add any other tables you need 