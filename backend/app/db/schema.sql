-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA & STORAGE POLICIES
-- Project: https://xvdqbkzwliyewakjvrsn.supabase.co
-- Run this entire script in Supabase SQL Editor (Dashboard -> SQL Editor)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'analyst' CHECK (role IN ('analyst', 'lead_investigator', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Files table (Stores metadata & hashes for evidence/data files)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_type TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    storage_provider TEXT DEFAULT 'supabase_storage' CHECK (storage_provider IN ('local', 'supabase_storage', 's3')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Analysis Jobs table (Tracks async processing state machine)
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Analysis Results table (Stores structured findings, threat scores, IOCs)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL UNIQUE REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    threat_score INT NOT NULL CHECK (threat_score >= 0 AND threat_score <= 100),
    verdict TEXT NOT NULL CHECK (verdict IN ('clean', 'suspicious', 'malicious', 'inconclusive')),
    summary TEXT NOT NULL,
    indicators JSONB DEFAULT '[]'::jsonb NOT NULL,
    raw_output JSONB DEFAULT '{}'::jsonb NOT NULL,
    mitre_tactics JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT LOOKUPS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_sha256 ON public.files(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_file_id ON public.analysis_jobs(file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_results_job_id ON public.analysis_results(job_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_file_id ON public.analysis_results(file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_threat_score ON public.analysis_results(threat_score DESC);

-- ====================================================================
-- 4. AUTOMATIC updated_at TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_files_updated_at ON public.files;
CREATE TRIGGER set_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.analysis_jobs;
CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.analysis_jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-sync new signups from auth.users into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Analyst'))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Files Policies (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own files" ON public.files;
CREATE POLICY "Users can view own files" ON public.files
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.files;
CREATE POLICY "Users can insert own files" ON public.files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.files;
CREATE POLICY "Users can delete own files" ON public.files
    FOR DELETE USING (auth.uid() = user_id);

-- Analysis Jobs Policies
DROP POLICY IF EXISTS "Users can view own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can view own jobs" ON public.analysis_jobs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can insert own jobs" ON public.analysis_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can update own jobs" ON public.analysis_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Analysis Results Policies (Accessible only if user owns the parent job)
DROP POLICY IF EXISTS "Users can view own analysis results" ON public.analysis_results;
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analysis_jobs j
            WHERE j.id = analysis_results.job_id
            AND j.user_id = auth.uid()
        )
    );

-- ====================================================================
-- 6. PRIVATE STORAGE BUCKET: "files" & ACCESS POLICIES
-- ====================================================================

-- Create private bucket 'files' (if not already existing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'files',
    'files',
    false, -- Private bucket
    52428800, -- 50MB limit
    NULL -- All types
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policy 1: Authenticated users can upload files into their own folder (folder name = user UUID)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy 2: Users can download/read objects from their own folder
DROP POLICY IF EXISTS "Users can read own folder objects" ON storage.objects;
CREATE POLICY "Users can read own folder objects" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy 3: Users can delete objects in their own folder
DROP POLICY IF EXISTS "Users can delete own folder objects" ON storage.objects;
CREATE POLICY "Users can delete own folder objects" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy 4: Service role / Backend Admin has full storage access
DROP POLICY IF EXISTS "Service role full storage access" ON storage.objects;
CREATE POLICY "Service role full storage access" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'files')
    WITH CHECK (bucket_id = 'files');
