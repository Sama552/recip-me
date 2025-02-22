-- Create a test user (the password will be 'password123')
-- Note: auth.users is managed by Supabase Auth, so we insert directly
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- Fixed UUID for testing
    'user@email.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (
    id,
    user_id,
    title,
    description,
    prep_time,
    cook_time,
    servings,
    source_url,
    source_type
) VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Classic Chocolate Chip Cookies',
    'Soft and chewy chocolate chip cookies that are perfect for any occasion.',
    '20 minutes'::interval,
    '10 minutes'::interval,
    24,
    'https://example.com/cookies',
    'personal'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Homemade Pizza',
    'Crispy crust pizza with fresh toppings.',
    '1 hour'::interval,
    '15 minutes'::interval,
    4,
    'https://example.com/pizza',
    'adapted'
);

-- Insert ingredients for cookies
INSERT INTO ingredients (
    recipe_id,
    name,
    amount,
    unit,
    notes
) VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'All-purpose flour',
    2.25,
    'cups',
    'sifted'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Chocolate chips',
    2,
    'cups',
    'semi-sweet'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Butter',
    1,
    'cup',
    'softened'
);

-- Insert ingredients for pizza
INSERT INTO ingredients (
    recipe_id,
    name,
    amount,
    unit,
    notes
) VALUES 
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pizza dough',
    1,
    'pound',
    'room temperature'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Mozzarella',
    2,
    'cups',
    'shredded'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Tomato sauce',
    1,
    'cup',
    'homemade or store-bought'
);

-- Insert instructions for cookies
INSERT INTO instructions (
    recipe_id,
    step_number,
    description
) VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1,
    'Preheat oven to 375°F (190°C)'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    2,
    'Cream together butter and sugars until smooth'
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    3,
    'Mix in flour and chocolate chips'
);

-- Insert instructions for pizza
INSERT INTO instructions (
    recipe_id,
    step_number,
    description
) VALUES 
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    1,
    'Preheat oven to 500°F (260°C) with pizza stone'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    2,
    'Roll out dough on floured surface'
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    3,
    'Top with sauce and cheese'
);

-- Insert sample tags
INSERT INTO tags (
    id,
    name
) VALUES 
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'dessert'
),
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'baking'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'italian'
),
(
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'main course'
);

-- Link tags to recipes
INSERT INTO recipe_tags (
    recipe_id,
    tag_id
) VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- cookies
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'   -- dessert
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- cookies
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'   -- baking
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- pizza
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'   -- italian
),
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- pizza
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'   -- main course
); 