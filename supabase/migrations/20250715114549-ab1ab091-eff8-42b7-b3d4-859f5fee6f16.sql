-- Add super_admin to the app_role enum (separate transaction)
ALTER TYPE public.app_role ADD VALUE 'super_admin';