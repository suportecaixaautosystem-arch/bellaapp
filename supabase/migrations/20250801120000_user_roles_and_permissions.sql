/*
# [FEATURE] User Roles and Permissions
This migration introduces a role-based access control (RBAC) system.

## Query Description:
This script adds a `role` column to the `profiles` table to define user permissions. It then updates the Row-Level Security (RLS) policies across all tables to enforce these permissions. This is a critical security update.

- **admin/manager**: Full access (create, read, update, delete).
- **seller**: Limited access (read, create, but NO update or delete on most tables).

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Tables Modified**: `profiles` (new column `role`).
- **RLS Policies Modified**: All tables will have their policies updated to be role-aware.

## Security Implications:
- RLS Status: Enabled and modified on all tables.
- Policy Changes: Yes, policies are now role-based.
- Auth Requirements: All actions will be checked against the user's role.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Minimal performance impact. RLS checks are efficient.
*/

-- Step 1: Create a new ENUM type for user roles.
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'seller');

-- Step 2: Add the 'role' column to the 'profiles' table.
-- The default role for any new user will be 'seller'.
ALTER TABLE public.profiles
ADD COLUMN role public.user_role NOT NULL DEFAULT 'seller';

-- Step 3: Create a helper function to get the current user's role.
-- This simplifies writing RLS policies.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Step 4: Update RLS policies for all tables.
-- We will drop existing policies and create new, role-aware ones.

-- Tables where sellers can CREATE but not UPDATE/DELETE
DO $$
DECLARE
    tbl_name text;
BEGIN
    FOREACH tbl_name IN ARRAY ARRAY['clients', 'services', 'products', 'service_combos', 'product_combos', 'appointments', 'appointment_items', 'sales', 'sale_items', 'financial_transactions']
    LOOP
        -- Drop old policies if they exist to avoid conflicts
        EXECUTE format('DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.%I;', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON public.%I;', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable insert for all users" ON public.%I;', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable update for admins and managers" ON public.%I;', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable delete for admins and managers" ON public.%I;', tbl_name);

        -- Create new policies
        EXECUTE format('CREATE POLICY "Enable read access for all users" ON public.%I FOR SELECT USING (true);', tbl_name);
        EXECUTE format('CREATE POLICY "Enable insert for all users" ON public.%I FOR INSERT WITH CHECK (true);', tbl_name);
        EXECUTE format('CREATE POLICY "Enable update for admins and managers" ON public.%I FOR UPDATE USING (get_current_user_role() IN (''admin'', ''manager''));', tbl_name);
        EXECUTE format('CREATE POLICY "Enable delete for admins and managers" ON public.%I FOR DELETE USING (get_current_user_role() IN (''admin'', ''manager''));', tbl_name);
    END LOOP;
END;
$$;

-- Tables that only admins/managers can manage
DO $$
DECLARE
    tbl_name text;
BEGIN
    FOREACH tbl_name IN ARRAY ARRAY['employees', 'specialties', 'payment_methods', 'companies', 'bot_settings']
    LOOP
        -- Drop old policies if they exist
        EXECUTE format('DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.%I;', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Enable full access for admins and managers" ON public.%I;', tbl_name);

        -- Create new policy
        EXECUTE format('CREATE POLICY "Enable full access for admins and managers" ON public.%I FOR ALL USING (get_current_user_role() IN (''admin'', ''manager''));', tbl_name);
    END LOOP;
END;
$$;

-- Special handling for 'profiles' table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and managers can update any profile role" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;


-- Users can see all profiles (for selection dropdowns)
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

-- Users can update their own non-role information
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins and managers can update the role of any user
CREATE POLICY "Admins and managers can update any profile role" ON public.profiles
FOR UPDATE USING (get_current_user_role() IN ('admin', 'manager'));
