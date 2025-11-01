-- Migration: Add analysis jobs table for tracking video analysis workflow
-- Created: 2025-10-31

-- Create analysis_jobs table
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_request_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    video_path TEXT NOT NULL,
    capture_meta JSONB,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure idempotency per user
    UNIQUE(user_id, client_request_id)
);

-- Add indexes for performance
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created_at ON analysis_jobs(created_at DESC);
CREATE INDEX idx_analysis_jobs_client_request_id ON analysis_jobs(client_request_id);

-- Enable RLS
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own jobs" ON analysis_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON analysis_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON analysis_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Add job_id reference to existing analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES analysis_jobs(id) ON DELETE SET NULL;

-- Add index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_analyses_job_id ON analyses(job_id);

-- Comment the table
COMMENT ON TABLE analysis_jobs IS 'Tracks video analysis jobs with status, timing, and metadata';
COMMENT ON COLUMN analysis_jobs.client_request_id IS 'UUID from client for idempotency';
COMMENT ON COLUMN analysis_jobs.capture_meta IS 'Video metadata: fps, resolution, club, angle, etc.';
COMMENT ON COLUMN analysis_jobs.video_path IS 'Path to video file in Supabase Storage';