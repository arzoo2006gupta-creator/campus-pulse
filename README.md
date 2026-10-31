# Campus Pulse — Modern Student Campus Dashboard

**Campus Pulse** is a production-ready, responsive full-stack web application designed for collegiate student life and administration. It serves as a unified digital campus hub for announcements, events, academic schedules, student resources, and student organizations.

---

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router (React Server Components & Server Actions)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom collegiate color system & responsive mobile drawer
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage)
- **Input Validation**: Zod schemas for all client and server mutations
- **Icons**: Lucide React
- **Testing**: Vitest for automated validation & security permission tests
- **Deployment**: Vercel configuration (`vercel.json`)

---

## 📁 Project Structure

```
campus/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Student & Admin sign in
│   │   ├── signup/page.tsx              # Student registration
│   │   ├── reset-password/page.tsx      # Password recovery
│   │   └── update-password/page.tsx     # Password reset confirmation
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Main dashboard layout with Sidebar & MobileNav
│   │   ├── page.tsx                     # Dashboard overview (announcements, events, dates)
│   │   ├── announcements/
│   │   │   ├── page.tsx                 # Announcements list, filters, search
│   │   │   └── [id]/page.tsx            # Announcement detail page & attachments
│   │   ├── events/
│   │   │   ├── page.tsx                 # Events list with upcoming/past views & search
│   │   │   └── [id]/page.tsx            # Event detail page & venue information
│   │   ├── calendar/page.tsx            # Academic calendar grouped by month
│   │   ├── resources/page.tsx           # Campus guides, portals & file downloads
│   │   ├── clubs/page.tsx               # Clubs & student societies directory
│   │   ├── bookmarks/page.tsx           # Cross-device saved announcements & events
│   │   ├── profile/page.tsx             # Student profile & notification preferences
│   │   └── admin/page.tsx               # Admin management portal (CRUD, publish/archive)
│   ├── auth/callback/route.ts           # Supabase Auth PKCE/Email exchange
│   ├── globals.css
│   └── layout.tsx                       # Root layout
├── components/
│   ├── navigation/
│   │   ├── sidebar.tsx                  # Left sidebar with student profile at top
│   │   ├── mobile-nav.tsx               # Mobile slide-in drawer
│   │   └── header.tsx                   # Header with date, profile status, admin pill
│   ├── ui/
│   │   ├── button.tsx                   # Accessible button with states
│   │   ├── badge.tsx                    # Category badges
│   │   ├── input.tsx                    # Inputs, textareas, selects
│   │   └── modal.tsx                    # Accessible dialog modal
│   ├── bookmark-button.tsx              # Optimistic database bookmark toggle
│   ├── delete-confirm-modal.tsx         # Confirmation modal before deletions
│   ├── empty-state.tsx                  # Empty state component
│   └── search-filter-bar.tsx            # Search and category filtering
├── lib/
│   ├── actions/
│   │   ├── auth.ts                      # Server actions for Auth
│   │   ├── profile.ts                   # Server actions for Profile (role protected)
│   │   ├── bookmarks.ts                 # Server actions for Bookmarks
│   │   └── admin.ts                     # Admin CRUD actions with permission checks
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── server.ts                    # Server Supabase client with cookies
│   │   └── middleware.ts                # Session refresh & protected route guard
│   ├── types/
│   │   └── database.ts                  # Typed TypeScript interfaces
│   ├── validations/
│   │   └── schemas.ts                   # Zod schemas for all forms
│   └── utils.ts                         # Formatting and styling helpers
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_initial_schema.sql # Complete PostgreSQL schema & RLS policies
│   └── seed.sql                         # Realistic sample campus seed data
├── tests/
│   ├── validations.test.ts              # Zod input validation & date logic tests
│   └── permissions.test.ts              # Security & role protection tests
├── .env.example
├── middleware.ts                        # Next.js route protection middleware
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── vitest.config.ts
```

---

## 🔒 Security & Role-Based Access Control (RBAC)

1. **Role Hierarchy**:
   - `student`: Standard access. Can view published campus announcements, events, calendar entries, resources, and clubs. Can manage their personal profile details (name, department, year, avatar, notification preferences) and toggle personal bookmarks.
   - `admin`: Elevated access. Can manage (create, edit, publish, archive, delete) all campus content and upload files to the `campus-assets` storage bucket.

2. **Role Escalation Protection**:
   - **Database Trigger**: A PostgreSQL trigger `tr_profile_update` rejects any modification of the `role` column unless performed by an authenticated admin via the security definer function `is_admin()`.
   - **Server Action Sanitization**: The `updateProfileAction` uses a Zod schema that strictly omits `role` and only passes permitted profile fields to the database.
   - **Row Level Security**: Every table has RLS enabled with distinct policies for students and admins.

3. **Bookmark Referential Integrity**:
   - Bookmarks use separate tables (`announcement_bookmarks`, `event_bookmarks`) with foreign keys linking directly to `profiles(id)`, `announcements(id)`, and `events(id)` with `ON DELETE CASCADE`.
   - Unique constraints (`user_id`, `announcement_id`) and (`user_id`, `event_id`) guarantee no duplicate bookmarks can be created.

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm
- A free [Supabase](https://supabase.com) account

### 2. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd campus
npm install
```

### 3. Setup Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name your project (e.g. `campus-pulse`) and choose a region close to your users.
3. Go to the **SQL Editor** in the left sidebar of your Supabase dashboard.
4. Open `supabase/migrations/20240101000000_initial_schema.sql` from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
   - This creates all tables (`profiles`, `announcements`, `events`, `academic_calendar`, `resources`, `clubs`, `announcement_bookmarks`, `event_bookmarks`), triggers, helper functions, and RLS policies.
   - It also creates the `campus-assets` storage bucket for document and image uploads.
5. (Optional) In the SQL Editor, open and run `supabase/seed.sql` to populate sample college announcements, upcoming events, academic deadlines, resources, and clubs.

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your actual Supabase credentials found in **Project Settings -> API** in the Supabase dashboard:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Securely Creating the First Admin
1. Register a new user account through the application UI at `http://localhost:3000/signup` with your admin email (e.g. `admin@campus.edu`).
2. Go to your **Supabase Dashboard -> SQL Editor** and execute the following query to elevate that user to `admin`:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@campus.edu'
);
```
3. Sign out and sign back in. The sidebar will immediately display your `ADMIN` badge and the **Admin Center** management links.

---

## 💻 Development & Testing

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Run Automated Tests
```bash
npm run test
```
Runs 18 unit and security tests verifying input validations, temporal event constraints, role escalation guards, and bookmark uniqueness.

### Run TypeScript Checks
```bash
npm run type-check
```

### Run ESLint
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

---

## 🚢 Vercel Deployment

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com) and click **Add New -> Project**.
3. Import your `campus` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase Service Role Key
   - `NEXT_PUBLIC_SITE_URL` = your Vercel deployment URL (e.g. `https://campus-pulse.vercel.app`)
5. Click **Deploy**.
6. Once deployed, add your Vercel URL to **Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs** (e.g. `https://campus-pulse.vercel.app/**`).

#   c a m p u s - p u l s e  
 #   c a m p u s - p u l s e  
 