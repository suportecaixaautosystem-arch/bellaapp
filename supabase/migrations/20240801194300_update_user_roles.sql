-- Add a 'role' column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN role user_role NOT NULL DEFAULT 'seller';

-- Add 'email' to profiles, to be synced from auth.users
ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- Update the existing trigger function to include the new 'role' and 'email'
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'seller' -- Default role for new users
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply the trigger to the users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow users to see their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Add policy to allow admins/managers to view all profiles
DROP POLICY IF EXISTS "Admins and managers can view all profiles." ON public.profiles;
CREATE POLICY "Admins and managers can view all profiles."
ON public.profiles FOR SELECT
USING (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb OR
  (get_my_claim('user_role'::text)) = '"manager"'::jsonb
);

-- Add policy to allow admins/managers to update profiles
DROP POLICY IF EXISTS "Admins and managers can update profiles." ON public.profiles;
CREATE POLICY "Admins and managers can update profiles."
ON public.profiles FOR UPDATE
USING (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb OR
  (get_my_claim('user_role'::text)) = '"manager"'::jsonb
)
WITH CHECK (
  (get_my_claim('user_role'::text)) = '"admin"'::jsonb OR
  (get_my_claim('user_role'::text)) = '"manager"'::jsonb
);

-- Function to get custom claims, including the user role
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT) RETURNS JSONB
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::JSONB ->> claim, NULL)::JSONB
$$;

-- Function to get the role of the current user
CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT
    LANGUAGE sql STABLE
    AS $$
  SELECT get_my_claim('user_role')::TEXT
$$;
