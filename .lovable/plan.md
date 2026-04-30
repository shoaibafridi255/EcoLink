## Goal
Complete EcoLink: enable backend, add auth + profiles, build missing pages, and wire up all non-functional buttons.

## 1. Enable Lovable Cloud (backend)
- Provision database, auth, storage
- Email/password + Google sign-in

## 2. Database schema
- `app_role` enum: `lister`, `seeker`
- `profiles` table (id → auth.users, full_name, company, location, role, avatar_url, created_at)
- `user_roles` table (id, user_id, role) — for secure role checks via `has_role()` security definer function
- Auto-create profile via trigger on `auth.users` insert
- RLS: users can read all profiles, update only their own; users can read own roles

## 3. Authentication pages
- `/auth` — combined Sign In / Sign Up tabs with role selector (Lister/Seeker), email/password + Google
- Auth context/hook (`useAuth`) with `onAuthStateChange` listener set up before `getSession()`
- Protected route wrapper for future authenticated pages

## 4. New pages
- `/how-it-works` — detailed step-by-step for Listers and Seekers (extends existing component)
- `/about` — EcoLink mission, sustainability impact, team/values
- Add routes in `App.tsx`

## 5. Wire up existing buttons
- **Navbar Sign In** → navigates to `/auth`
- **Navbar Get Started** → `/auth` (signup tab) when logged out; shows user menu (profile, sign out) when logged in
- **Navbar Search icon** → opens search dialog (command palette) for materials/categories
- **Hero CTAs** → "List Material" → `/auth` or `/dashboard`; "Find Materials" → `/browse` (placeholder for now)
- **Footer / CTA section links** → wire to actual routes
- Mobile menu parity

## 6. Validation & polish
- Zod schemas on auth forms (email, password ≥ 8 chars, name)
- Toast feedback on signup/login success/error
- Loading states
- Maintain existing design system (semantic tokens only)

## Technical notes
- Roles stored in `user_roles` table (NOT on profiles) — prevents privilege escalation
- `has_role(uuid, app_role)` SECURITY DEFINER function for RLS checks
- Auth redirect: `emailRedirectTo: window.location.origin`
- Search dialog uses existing shadcn `command` component
- All new pages follow existing Navbar/Footer layout

## Out of scope (future steps)
- Material listing CRUD (Browse / Create Listing pages) — flagged as next milestone
- Messaging between Listers and Seekers
- File uploads for material photos