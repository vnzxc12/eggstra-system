-- ==============================================================================
-- Eggstra Poultry Farm Management System - User Profiles & RBAC
-- ==============================================================================

-- 1. Create user_profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('master_admin', 'manager', 'farm_hand', 'viewer')) DEFAULT 'farm_hand',
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Master Admins can view and manage all profiles
CREATE POLICY "Master Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'master_admin' AND status = 'active'
        )
    );

-- Allow public read of own profile during initial authentication
CREATE POLICY "Allow authenticated read" ON public.user_profiles
    FOR SELECT TO authenticated USING (true);

-- 3. Automatic Trigger to create user_profile upon auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'farm_hand'),
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Seed Master Admin in user_profiles
DO $$
DECLARE
    v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
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
    END IF;

    INSERT INTO public.user_profiles (id, email, full_name, role, status)
    VALUES (v_admin_id, 'admin@eggstra.farm', 'Master Farm Administrator', 'master_admin', 'active')
    ON CONFLICT (id) DO UPDATE SET
        role = 'master_admin',
        status = 'active';
END $$;
