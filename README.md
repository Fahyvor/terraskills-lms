# Terraskills LMS • Learning Systems Limited

Enterprise-grade Learning Management System (LMS) created for **Terraskills Learning Systems Limited** using a modern full-stack architecture: React 19, TypeScript, Vite 6, Tailwind CSS v4, Redux Toolkit, React Router v7, Node.js + Express, Prisma ORM 6, and PostgreSQL.

![Terraskills Logo](public/terraskills-logo.png)

---

## ✨ System Architecture & Highlights

- **Terraskills Signature Brand Identity**:
  - Authentic Terraskills Royal Blue (`#004BBB`) and Crimson Red (`#E5192D`) styling.
  - Light mode by default with seamless Dark Mode toggle.
  - Editorial design using *Plus Jakarta Sans* typography, responsive layouts without restrictive container widths (`w-full`), and clean micro-interactions.
  - Instant user feedback powered by `sleek-toast`.

- **6 Official Terraskills Masterclasses**:
  - **Digital Marketing**: Performance marketing, SEO/SEM, conversion rate optimization, email funnels, and data-driven growth.
  - **Frontend Development**: React 19, Next.js, modern TypeScript, Tailwind CSS, accessible UI components, and state management.
  - **Backend Development**: Python, Django, Django REST Framework (DRF), PostgreSQL, ORM modeling, secure JWT authentication, and cloud deployment.
  - **Data Analytics**: Python (Pandas, NumPy), SQL relational querying, statistical modeling, data visualization, and business intelligence.
  - **AI Automation**: LLMs, workflow automations, API integrations, agentic pipelines, and autonomous AI systems.
  - **Cybersecurity**: Network defense, vulnerability assessments, penetration testing, threat hunting, and enterprise security compliance.

- **Curriculum Admission & Access Control Workflow**:
  - **Open Catalog Exploration**: All courses are open for students and prospective candidates to explore syllabi, outcomes, and instructor credentials.
  - **Admission Application**: Students apply for admission (`status: "pending"`).
  - **Facilitator Access Grant**: Assigned facilitators review candidate details (email, WhatsApp, address) and grant or revoke access via the **Instructor Studio** (`/studio`).
  - **Guarded Classroom (`/courses/:slug/learn`)**: Only students with approved admission (or facilitators/admins) can enter the video classroom. Students awaiting review see a clear admission status screen.
  - **Student Dashboard (`/dashboard`)**: Approved courses are accessible immediately under "Active Curricula", while unapproved courses appear in "Pending Facilitator Admissions".

- **Discrete Instructor & Facilitator Portal**:
  - Discrete URLs (`/instructor/login` and `/instructor/register`) kept private and unlinked on the main student-facing navigation.
  - When facilitators register, they select their assigned course specialization, automatically linking them to their curriculum.

- **Instructor & Facilitator Studio (`/studio`)**:
  - **Student Admissions & Access Control**: Real-time admission review, 1-click access granting/revoking, direct student enrollment, and WhatsApp candidate outreach.
  - **Course Authoring & Syllabus Builder**:
    - **Course Target Selector**: Choose any of the 6 official courses to fill in modules, lessons, and video URLs, or create a brand-new course shell.
    - **Dual Video Support**: Embed YouTube videos or upload native MP4/WebM video files directly.
    - **RESTful Syllabus Updates**: `PUT /api/courses/:id` to save and publish curriculum changes.

- **Granular Progress & Verifiable Certification**:
  - Live progress tracking synchronized with PostgreSQL database (`LessonProgress` records).
  - Celebration confetti explosion upon 100% course completion.
  - Verifiable **Certificate of Completion** (`/certificates/:certId`) featuring unique serial codes (`TS-XXXX-XXXX`), student name, completion date, and print/PDF export.

- **Interactive Classroom Tools**:
  - **Timestamped Private Study Notes**: Take timestamped notes attached to individual lectures.
  - **Lecture Resources**: Downloadable reference files and external code repositories.
  - **Dual Video Player**: YouTube iframe embed or native HTML5 player with speed controls (0.75x to 2x).

- **Defense-in-Depth Native Security**:
  - 12-round **bcrypt** password hashing.
  - Signed **JWT** tokens with role-based access control (`student`, `instructor`, `admin`).
  - Parameterized database operations via **Prisma ORM** against PostgreSQL.
  - Input sanitization and security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`).
  - Robust connection pooling with exponential backoff retry (`withDbRetry`) resilient against cloud database proxy cold-starts.

---

## 🏛️ Project Directory Structure

```text
terraskills-lms/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Prisma ORM PostgreSQL schema (User, Course, Module, Lesson, Enrollment, LessonProgress, Note, Review)
│   ├── src/
│   │   ├── config.ts           # Centralized configuration & environment variables
│   │   ├── index.ts            # Express server entry point & SPA fallback
│   │   ├── prisma.ts           # Resilient Prisma client singleton with connection pooling & retries
│   │   ├── seed.ts             # Official Terraskills 6 curricula seed script
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication, optionalAuth, and requireRole checks
│   │   │   ├── security.ts     # In-memory rate limiting, security headers, input sanitization
│   │   │   └── upload.ts       # Multer video and image upload handlers
│   │   └── routes/
│   │       ├── auth.ts         # Student & instructor login, registration, profile updates
│   │       ├── courses.ts      # Catalog, slug details, admission apply, course create (POST), update (PUT), delete (DELETE)
│   │       ├── facilitator.ts  # Facilitator admissions list, grant access, revoke access, direct enroll
│   │       ├── notes.ts        # Lecture-specific private study notes CRUD
│   │       ├── progress.ts     # Lesson completion toggle & course progress metrics
│   │       └── upload.ts       # Video and thumbnail file upload endpoints
│   ├── uploads/                # Local storage for uploaded lecture videos and course assets
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── terraskills-logo.png    # Official Terraskills logo
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx       # Student sign in / register modal
│   │   ├── CertificateModal.tsx # Certificate viewer modal with print/PDF support
│   │   ├── CourseCard.tsx      # Curriculum display cards with admission status badges
│   │   ├── CoursePlayer.tsx    # Live classroom layout with video player, notes tab, and syllabus drawer
│   │   ├── DashboardView.tsx   # Student dashboard with active curricula & pending admissions
│   │   ├── Footer.tsx          # Brand footer with accredited career links
│   │   ├── HeroBanner.tsx      # Brand hero banner with official course category filters
│   │   ├── InstructorStudioModal.tsx # Facilitator studio: admissions manager + course authoring tool
│   │   ├── Layout.tsx          # Master application layout
│   │   ├── LessonNotes.tsx     # Interactive timestamped private study notes component
│   │   ├── Navbar.tsx          # Header with branding, search, theme switcher, and student profile
│   │   ├── ProtectedRoute.tsx  # Route guards for authentication and role requirements
│   │   ├── ScrollToTop.tsx     # Window scroll reset on route navigation
│   │   └── VideoPlayer.tsx     # YouTube embed & native HTML5 video player with speed toggles
│   ├── pages/
│   │   ├── CertificatePage.tsx # Standalone verifiable certificate page (/certificates/:certId)
│   │   ├── CourseDetailPage.tsx# Detailed course overview & syllabus (/courses/:slug)
│   │   ├── CoursePlayerPage.tsx# Video classroom with admission guard (/courses/:slug/learn)
│   │   ├── DashboardPage.tsx   # Student dashboard portal (/dashboard)
│   │   ├── HomePage.tsx        # Landing page & course catalog (/)
│   │   ├── InstructorLoginPage.tsx # Discrete instructor portal login (/instructor/login)
│   │   ├── InstructorRegisterPage.tsx # Discrete instructor onboarding (/instructor/register)
│   │   ├── InstructorStudioPage.tsx # Full-page facilitator studio (/studio)
│   │   ├── LoginPage.tsx       # Standalone student login page (/login)
│   │   ├── NotFoundPage.tsx    # Custom 404 page
│   │   └── RegisterPage.tsx    # Standalone student registration page (/register)
│   ├── store/
│   │   ├── index.ts            # Redux Toolkit store configuration
│   │   └── slices/
│   │       ├── authSlice.ts    # Authentication, user profile, and active enrollments
│   │       ├── courseSlice.ts  # Courses catalog, active course, create/update course thunks
│   │       ├── progressSlice.ts# Real-time lesson progress & certificate status
│   │       └── themeSlice.ts   # Dark / light theme toggle with localStorage persistence
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain models
│   ├── App.tsx                 # React Router v7 routes & sleek-toast container
│   ├── index.css               # Tailwind CSS v4 directives & custom themes
│   └── main.tsx                # React 19 application mount point
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts              # Vite 6 config with Tailwind CSS v4 plugin & API proxy
```

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Node.js**: `v20.x` or later
- **npm** or **pnpm**
- **PostgreSQL**: Remote or local database instance

### 2. Environment Variables
Create `.env` in the root (and `backend/.env`):

```env
# PostgreSQL connection string (supports pooled proxies like Neon, Supabase, Prisma Accelerate)
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require&connect_timeout=60&pool_timeout=0&connection_limit=5"

# Cryptographic secret for signing JWTs
JWT_SECRET="your-super-secure-jwt-secret-key"

# Port (defaults to 3000)
PORT=3000
```

### 3. Install Dependencies
```bash
# Install root and frontend dependencies
npm install

# Install backend dependencies
npm run install:backend
```

### 4. Database Setup & Seeding
```bash
cd backend

# Run Prisma schema migrations or push
npx prisma db push

# (Optional) Seed the database with official Terraskills curricula
npx tsx src/seed.ts
```

### 5. Running the Application
```bash
# Run both Frontend (Vite) and Backend (Express) concurrently:
npm run dev:full
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`

---

## 📦 Production Build & Deployment

```bash
# Compile frontend bundle into backend/public and build TypeScript backend
npm run build

# Start the unified production server
npm start
```
The application runs on a single unified port (`http://localhost:3000`) serving both the REST API and the compiled Single Page Application (SPA).

---

## 📡 API Reference Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Student account registration |
| `POST` | `/api/auth/login` | Public | Student authentication & JWT issuance |
| `POST` | `/api/auth/instructor/register` | Public (Discrete) | Facilitator onboarding with course specialization selection |
| `POST` | `/api/auth/instructor/login` | Public (Discrete) | Facilitator sign in |
| `GET` | `/api/auth/me` | Authenticated | Fetch current profile and active enrollments |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, address, and bio |
| `GET` | `/api/courses` | Public | List published courses with category and search filters |
| `GET` | `/api/courses/:slug` | Public / Optional Auth | Course syllabus, lessons, and student progress status |
| `POST` | `/api/courses/enroll/:courseId` | Authenticated | Apply for admission to a course |
| `POST` | `/api/courses` | Instructor / Admin | Create a new course shell and syllabus |
| `PUT` | `/api/courses/:id` | Instructor / Admin | Update course metadata, modules, and video lessons |
| `DELETE` | `/api/courses/:id` | Instructor / Admin | Delete a course |
| `GET` | `/api/facilitator/admissions` | Instructor / Admin | List all student applications, students, and courses |
| `POST` | `/api/facilitator/grant-access` | Instructor / Admin | Approve student admission to classroom |
| `POST` | `/api/facilitator/revoke-access` | Instructor / Admin | Revoke student access to course |
| `POST` | `/api/facilitator/direct-enroll` | Instructor / Admin | Directly enroll a registered student with approved access |
| `POST` | `/api/progress/toggle` | Authenticated | Toggle lesson completion and update progress percent |
| `GET` | `/api/progress/course/:courseId`| Authenticated | Get user's progress and certificate ID for a course |
| `GET` | `/api/notes/lesson/:lessonId` | Authenticated | Fetch user's timestamped study notes for a lesson |
| `POST` | `/api/notes` | Authenticated | Create a private study note |
| `DELETE`| `/api/notes/:id` | Authenticated | Delete a study note |
| `POST` | `/api/upload/video` | Instructor / Admin | Upload direct video files (MP4, WebM) |
| `POST` | `/api/upload/thumbnail` | Instructor / Admin | Upload course cover thumbnails |

---

## 🔒 Security Best Practices
- **Role Verification**: Endpoints under `/api/facilitator/*` and course modification routes strictly enforce instructor or admin roles.
- **Classroom Gate**: Access to `/courses/:slug/learn` is restricted to users with approved admissions.
- **Connection Resilience**: Prisma calls are wrapped in `withDbRetry` to handle pooled database cold-starts automatically.
- **Discrete URLs**: Facilitator portals are accessible at `/instructor/login` and `/instructor/register` without public links exposed on student interfaces.

---

© 2026 Terraskills Learning Systems Limited. All rights reserved.
