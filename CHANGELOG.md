# Changelog

All notable changes to the NCC Digital Training & Assessment Platform will be documented in this file.

## [Unreleased]
- Initialized documentation review and implementation planning.
- Set up React + Vite frontend workspace with Tailwind CSS v4 and React Router DOM.
- Initialized Node.js + Express backend workspace with CORS and dotenv.
- Configured modular project directory structure for both frontend and backend.
- Created base Supabase SQL migration for `cadet_profiles` schema and RLS policies.
- Set up initial routing and baseline UI in `App.jsx`.
- Implemented `AuthContext`, `Login`, `Register`, and `Dashboard` pages with Supabase auth flow.
- Added Express JWT verification middleware for the backend (`authMiddleware.js`).
- Created Supabase migration `00002_courses_and_progress.sql` for Hybrid LMS schema.
- Built immersive `CourseLayout`, `CourseDetail`, and `ChapterViewer` components.
- Integrated dynamic rendering for Native Image Carousel (Option C) and Native React Markdown (Option D).
- Refactored `App.jsx` routing to support `MainLayout` and distraction-free `CourseLayout`.
