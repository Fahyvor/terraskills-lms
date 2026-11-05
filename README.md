# Terraskills LMS • Learning Systems Limited

Enterprise-grade Learning Management System (LMS) created for **Terraskills Learning Systems Limited** using **nub-stack** (Node.js + Express + TypeScript + React 19 + Tailwind CSS v4 + Prisma ORM + Redux Toolkit).

![Terraskills Logo](public/terraskills-logo.png)

---

## ✨ Highlights & Features

- **Terraskills Signature Brand Identity**:
  - Authentic Terraskills Royal Blue (`#004BBB`) and Crimson Red (`#E5192D`) styling.
  - Light mode by default with seamless Dark Mode toggle.
  - Human, crafted editorial feel using *Plus Jakarta Sans* typography, refined micro-interactions, and responsive layout.

- **Granular Progress Bar & Milestone Tracking**:
  - Real-time persistent progress bar indicating course completion percentage (`67% • 4 of 6 lessons`).
  - Checkbox per lesson allowing immediate completion toggling and progress synchronization.
  - Confetti celebration explosion upon 100% course completion.
  - Official, verifiable **Certificate of Completion** generated with unique serial codes (`TS-XXXX-XXXX`), faculty signatures, and printable PDF export.

- **Dual Video Lecture Player**:
  - **YouTube Integration**: Embeds YouTube educational lectures with automatic ID extraction and responsive 16:9 container.
  - **Direct Video Upload Option**: Native HTML5 player supporting direct file uploads (MP4, WebM) with custom controls, playback speed selector (0.75x to 2x), volume slider, and progress scrubber.

- **Interactive Learning Tools**:
  - **Timestamped Private Study Notes**: Take notes attached to specific lectures, saved directly into the database.
  - **Curricular Resources**: Downloadable PDF lecture slides and exercise sandbox links.
  - **Curriculum Sidebar Drawer**: Collapsible module accordions with live progress indicators.

- **Student Portal ("My Learning")**:
  - Enrolled courses dashboard with progress bars and "Resume Learning" shortcuts.
  - Certificate gallery for completed programs.

- **Instructor Studio**:
  - Accessible to instructors and admins.
  - Create new courses, modules, and lessons.
  - Choose between YouTube URLs or uploading video files directly.

- **Defense-in-Depth Native Security (Best Practices)**:
  - Cryptographic password hashing using **12-round bcrypt salt**.
  - Cryptographically signed **JWT tokens** (7-day validity).
  - In-memory **sliding-window rate limiter** on authentication routes to stop brute-force attacks.
  - Native **Prisma parameterized queries** preventing SQL injection.
  - **Input sanitization middleware** stripping XSS and script injections.
  - **Security response headers** (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, custom `Content-Security-Policy`).
  - Safe file uploads via **Multer** with strict MIME type allowlists and randomized collision-resistant file names.
  - Centralized error handler avoiding stack trace leakage in production.

---

## 🚀 Quick Start

### 1. Development Mode (Dual-Mode Vite Proxy)
```bash
npm run dev:full
```
- **Frontend (Vite + Tailwind v4 + HMR)**: `http://localhost:5173`
- **Backend API (Express + Prisma)**: `http://localhost:3000/api`

### 2. Production Mode (Unified Backend Static Host)
```bash
# Build frontend bundle into backend/public and compile TypeScript backend
npm run build

# Start the unified production server
npm start
```
- **Unified App**: `http://localhost:3000`

### 3. Database Management (Prisma ORM)
```bash
cd backend
npx prisma studio     # Launch visual database browser
npx tsx src/seed.ts   # Re-seed database with default Terraskills curricula
```

---

## ⚡ Instant Demo Credentials

The login modal contains **1-Click Demo Login** buttons for instant evaluation:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Student** | `student@terraskills.com` | `Terraskills123!` | Alex Favour |
| **Instructor** | `instructor@terraskills.com` | `Terraskills123!` | Dr. Sarah Ibrahim |

*(You can also register any new account directly through the Sign Up modal).*

---

## 🏛️ Project Directory Structure

```text
terraskills-lms/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite database schema (User, Course, Module, Lesson, Progress, Note)
│   │   └── dev.db             # Local SQLite database
│   ├── src/
│   │   ├── config.ts          # Centralized configuration & environment variables
│   │   ├── index.ts           # Express server entry point & SPA fallback
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── seed.ts            # Realistic Terraskills course seed data
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT token authentication & role checks
│   │   │   ├── security.ts    # Rate limiting, security headers, input sanitization
│   │   │   └── upload.ts      # Multer safe video and thumbnail file uploads
│   │   └── routes/
│   │       ├── auth.ts        # Register, Login, Demo, Profile
│   │       ├── courses.ts     # Course catalog, syllabus, enrollment, studio creation
│   │       ├── progress.ts    # Lesson completion toggle, watch time, certificate issue
│   │       ├── notes.ts       # Student personal timestamped study notes
│   │       └── upload.ts      # Video & thumbnail upload endpoints
│   ├── uploads/               # Uploaded video and image files storage
│   └── package.json
├── public/
│   └── terraskills-logo.png   # Terraskills official logo
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx      # Sign in / Register / 1-Click Demo tabs
│   │   ├── CertificateModal.tsx # Verifiable Certificate of Completion
│   │   ├── CourseCard.tsx     # Curriculum cards with progress indicators
│   │   ├── CoursePlayer.tsx   # Classroom view with sticky progress bar & syllabus drawer
│   │   ├── DashboardView.tsx  # "My Learning" student portal
│   │   ├── HeroBanner.tsx     # Brand hero with category quick-filters
│   │   ├── InstructorStudioModal.tsx # Course creation with YouTube or upload options
│   │   ├── LessonNotes.tsx    # Interactive personal note-taking
│   │   ├── Navbar.tsx         # Brand header, search, theme switcher, user dropdown
│   │   └── VideoPlayer.tsx    # YouTube embed + HTML5 video player with speed controls
│   ├── store/
│   │   ├── index.ts           # Redux Toolkit store
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── courseSlice.ts
│   │       ├── progressSlice.ts # Progress percentage & canvas-confetti trigger
│   │       └── themeSlice.ts   # Light/dark mode toggle with localStorage sync
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css              # Tailwind CSS v4 styling & dark theme variants
│   └── main.tsx
├── package.json
└── vite.config.ts
```
