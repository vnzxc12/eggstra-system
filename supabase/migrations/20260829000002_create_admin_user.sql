-- ==============================================================================
-- Eggstra Poultry Farm Management System - Master Admin User Setup
-- ==============================================================================

-- 1. Create Profiles / Farm Users table linked to auth.users (if not already existing)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'master_admin' CHECK (role IN ('master_admin', 'farm_manager', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id OR id IS NULL);

-- 2. Seed Master Admin User into Supabase Auth (if using pgcrypto)
DO $$
DECLARE
    v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Check if user already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@eggstra.farm') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_admin_id,
            'authenticated',
            'authenticated',
            'admin@eggstra.farm',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"username":"admin","full_name":"Master Farm Administrator","role":"master_admin"}',
            now(),
            now()
        );

        INSERT INTO public.profiles (id, username, full_name, role)
        VALUES (v_admin_id, 'admin', 'Master Farm Administrator', 'master_admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
