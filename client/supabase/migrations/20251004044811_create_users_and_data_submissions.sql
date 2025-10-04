/*
  # Initial Database Setup for Modern React Application

  ## Overview
  This migration sets up the core database structure for a React application with authentication
  and dynamic data submissions.

  ## New Tables
  
  ### 1. `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User's email address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `data_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `row_count` (integer) - Number of rows user selected
  - `submission_type` (text) - Type of submission: 'text', 'textarea', or 'file'
  - `data` (jsonb) - Stores the submitted data (text entries or file metadata)
  - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read/write only their own profile
  - Users can read/write/delete only their own submissions
  - All policies require authentication
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create data submissions table
CREATE TABLE IF NOT EXISTS data_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  row_count integer NOT NULL,
  submission_type text NOT NULL CHECK (submission_type IN ('text', 'textarea', 'file')),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Data submissions policies
CREATE POLICY "Users can view own submissions"
  ON data_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submissions"
  ON data_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own submissions"
  ON data_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own submissions"
  ON data_submissions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_submissions_user_id ON data_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_data_submissions_created_at ON data_submissions(created_at DESC);