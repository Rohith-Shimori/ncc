# Git and Supabase Setup Guide

This document describes how to push this repository to your personal GitHub account and how to set up a Supabase database.

---

## 1. Pushing to a New GitHub Repository

Run these commands in your terminal inside the root directory (`NCC-Digital-Training-main`):

```bash
# Initialize git if you haven't already
git init

# Add all files to staging
git add .

# Create the initial commit
git commit -m "Initial commit of NCC platform"

# Rename the branch to main
git branch -M main

# Add your personal repository as the remote origin
# (Replace with your actual GitHub username and repository name)
git remote add origin https://github.com/<your-username>/NCC-Digital-Training.git

# Push to your repository
git push -u origin main
```

---

## 2. Setting Up Supabase (Cloud Database)

1. Go to [Supabase](https://supabase.com) and create a free account.
2. Click **New Project** and name it (e.g., `NCC-Digital-Training`). Choose a database password.
3. Wait for the database to provision (usually takes 1–2 minutes).
4. Go to **Project Settings** (gear icon in the sidebar) -> **API** and copy:
   - **Project URL** (e.g., `https://xyzabc.supabase.co`)
   - **anon public key** (API key labeled as `anon`)

---

## 3. Running SQL Schema Migrations

Go to the **SQL Editor** tab (SQL console icon in the left menu) in your Supabase Dashboard:

1. Click **New Query**.
2. Copy and paste the contents of each file in the `supabase/migrations/` folder, **one by one, in order**:
   - `00001_initial_schema.sql`
   - `00002_courses_and_progress.sql`
   - `00003_instructors_and_wings.sql`
   - `00004_complete_schema.sql`
   - `00005_schema_enhancements.sql`
   - `00006_seed_data.sql`
   - `00007_seed_chapters_questions.sql`
   - `00008_rls_hardening.sql`
   - `00009_test_accounts.sql`
   - `00010_dashboard_content.sql`
   - `00011_notifications_and_exp.sql`
   - `00012_system_wide_notifications.sql`
   - `00013_announcement_notifications.sql`
   - `00014_fix_exam_logic.sql`
   - `production_patch_v1.sql`
   - `00015_complete_syllabus_seeds.sql`
3. Click **Run** for each query. This will configure the tables, indexes, row-level security (RLS) policies, and test accounts.

---

## 4. Connecting the React Frontend

Create a file named `.env` in the `frontend` folder:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Replace the values with your actual URL and Anon Key. Restart the development server (`npm run dev`) to apply the environment variables.
