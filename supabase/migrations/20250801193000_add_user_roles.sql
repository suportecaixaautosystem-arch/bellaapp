/*
  # [Feature: User Roles and Permissions]
  This migration adds a `role` column to the `profiles` table to manage user permissions.

  ## Query Description:
  - Adds a new `role` column to the `public.profiles` table to store user roles (admin, manager, seller).
  - Sets a default role of 'seller' for all new users.
  - Updates the Row Level Security (RLS) policies on the `profiles` table to allow admins and managers to view and manage all users, while regular users can only see their own profile.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table Modified: `public.profiles`
  - Column Added: `role` (text, not null, default 'seller')
  - Policies Modified: RLS policies for SELECT and UPDATE on `public.profiles`.

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes. This is crucial for the permission system to work correctly.
  - Auth Requirements: Users must be authenticated.

  ## Performance Impact:
  - Indexes: None added.
  - Triggers: None added.
  - Estimated Impact: Low.
*/

-- 1. Add the role column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN role TEXT NOT NULL DEFAULT 'seller';

-- 2. Create a function to check user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update RLS policies for profiles table
-- First, drop existing policies to redefine them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow admins and managers to view all profiles
CREATE POLICY "Admins and managers can view all profiles."
ON public.profiles FOR SELECT
USING (get_my_role() IN ('admin', 'manager'));

-- Users can insert their own profile (this is handled by the trigger `handle_new_user`)
-- We keep an insert policy for safety, but the trigger is primary.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins and managers to update any profile's role
CREATE POLICY "Admins and managers can update any profile."
ON public.profiles FOR UPDATE
USING (get_my_role() IN ('admin', 'manager'));

-- Note: Deletion of profiles should be handled with care, possibly only by admins via backend logic or triggers.
-- For now, we will not create a DELETE policy to prevent accidental user deletion from the UI.
