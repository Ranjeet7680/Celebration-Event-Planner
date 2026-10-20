# Celebration-Event-Planner

<p align="center">
  <img src="https://raw.githubusercontent.com/Ranjeet7680/Celebration-Event-Planner/main/assets/header-banner.svg" alt="PromptWars Celebration &amp; Event Planner Header Banner" width="100%" />
</p>

<p align="center">
  <strong>Every celebration starts with a spark.</strong><br>
  A production-grade, AI-powered celebration and event planning platform built with Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma ORM, and Recharts.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Tests-29%20Passed-34D399?style=for-the-badge" alt="Automated Tests" />
  <a href="https://github.com/Ranjeet7680/Celebration-Event-Planner/wiki"><img src="https://img.shields.io/badge/Documentation-Wiki-8B5CF6?style=for-the-badge&logo=gitbook" alt="GitHub Wiki" /></a>
</p>

---

## 📸 Architectural & Workflow Visualizations

### 1. AI Event Synthesis Pipeline
Natural-language vision transformed through structured Zod schema validation into multi-entity database records:
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranjeet7680/Celebration-Event-Planner/main/assets/diagram-ai-workflow.svg" alt="AI Event Synthesis Flow" width="100%" />
</p>

---

### 2. Full-Stack System Architecture Topology
Client presentation, Next.js server route handlers, AI multi-model provider adapter, and Prisma relational persistence:
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranjeet7680/Celebration-Event-Planner/main/assets/diagram-architecture.svg" alt="System Architecture Topology" width="100%" />
</p>

---

### 3. Five-Stage Celebration Orchestration Lifecycle
Continuous execution loop connecting prompts, blueprint validation, operations, RSVPs, and live execution:
<p align="center">
  <img src="https://raw.githubusercontent.com/Ranjeet7680/Celebration-Event-Planner/main/assets/diagram-lifecycle.svg" alt="Celebration Orchestration Lifecycle" width="100%" />
</p>

---

## 🌟 Core System Capabilities

1. **AI Event Architecture & Local Demo Fallback**
   - Extracts date, location, attendee headcounts, and multi-currency budgets from natural-language prompts.
   - Generates 6-category budget allocations, 4-phase preparation timelines, 48-hour hourly rundowns, prioritized task arrays, team roles, and risk contingency plans.
   - Fully supports **Google Gemini API** (`GEMINI_API_KEY`) and **OpenAI** (`OPENAI_API_KEY`), with an intelligent deterministic local demo generator when no API key is provided.
   - 1-click **"Accept & Create Event"** converts AI blueprints into actual relational database records.

2. **20 Full Functional Pages**
   - **Landing Page** (`/`): High-converting presentation, live prompt simulator, feature matrix, and pricing tiers.
   - **Sign Up** (`/signup`): Secure user registration with bcrypt password hashing.
   - **Login** (`/login`): Authentication with 1-click demo account auto-fill.
   - **Onboarding** (`/onboarding`): Personalized user interest, budget scale, and experience configuration.
   - **Dashboard** (`/dashboard`): Metrics, upcoming celebrations grid, and live audit activity stream.
   - **AI Event Creator** (`/ai-creator`): Interactive prompt box, tabbed preview, section regeneration, and persistence.
   - **Event Templates** (`/templates`): Cultural Festivals, Royal Weddings, Tech Summits, and Rooftop Bashes with instant "Use Template" project generator.
   - **Event Overview** (`/events/[id]`): High-res cover hero, countdown timer, budget utilization, task progress, collaborator roster, and edit/delete controls.
   - **Calendar** (`/calendar`): Month grid and Agenda list views with date navigation, event markers, and day click modal.
   - **Guest Management** (`/guests` & `/events/[id]/guests`): RSVP tracking (Attending, Tentative, Declined, Pending), plus-ones, dietary restrictions, group filtering, and **real CSV export**.
   - **Invitation Designer** (`/invitations` & `/events/[id]/invitation`): Live interactive invitation preview with dynamic primary/accent colors, font styles, venue address, QR badge simulator, and print/PDF export.
   - **Venue Discovery** (`/venues`): Curated architectural ballrooms and botanical gardens with capacity filters, price sliders, favorites toggle, and direct booking inquiries.
   - **Vendor Marketplace** (`/vendors`): Decorators, caterers, photographers, live entertainers, and florists with service inquiries and portfolio pricing.
   - **Budget Planner** (`/budget` & `/events/[id]/budget`): Expense ledger, paid vs. pending status, category bar chart, and **automated over-budget warning guards**.
   - **Theme & Decoration Studio** (`/studio`): Harmonic color swatch palettes with 1-click HEX clipboard copy, inspiration photo gallery, and custom moodboard items.
   - **Task Management** (`/tasks` & `/events/[id]/tasks`): 3-column Kanban workflow board (To Do, In Progress, Completed), drag/status arrows, overdue deadline indicators, and velocity gauge.
   - **Team Collaboration** (`/team`): Multi-role access control (Owner, Admin, Editor, Viewer), collaborator invitations, and audit activity logs.
   - **Analytics & Reports** (`/analytics`): Interactive Recharts graphs for category spending, RSVP breakdown donuts, task velocity, and **1-click Executive Report JSON/CSV download**.
   - **Notifications & Inbox** (`/notifications`): Real-time in-app alert feed for task assignments, RSVP changes, and budget milestones with "Mark all as read".
   - **Profile & Settings** (`/settings`): Profile editor, theme switcher, notification toggles, and secure password updates.

3. **Midnight Luxury Design System**
   - Palette: Midnight Navy (`#0B1020`), Secondary (`#11182B`), Card (`#171F35`), Violet (`#8B5CF6`), Indigo (`#6366F1`), and Celebration Gold (`#F5C76B`).
   - Ambient glows, glassmorphism backdrop blurs, responsive mobile navigation drawer, and global `Ctrl+K` search modal.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
A `.env` file is pre-configured for local execution:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="promptwars_super_secret_jwt_key_2026_change_in_production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional External AI API Keys (app defaults to deterministic local demo mode if omitted):
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

### 3. Initialize Database & Seed Sample Celebrations
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Automated Test Suite
```bash
npm test
```
*Executes all 29 automated test assertions across authentication, authorization, AI schemas, budget calculations, guest RSVPs, and task Kanban progress with 0 failures.*

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Demo Credentials

You can log in immediately using the pre-seeded account:
- **Email**: `demo@promptwars.ai`
- **Password**: `Password123!`
*(The login screen also features a 1-click **"Fill Demo Credentials"** button).*

---

## 📦 Git & GitHub Deployment Instructions

To push this repository to GitHub:

```bash
git init
git add .
git commit -m "feat: complete PromptWars celebration event planner with 20 pages, AI engine, and animated diagrams"
git branch -M main
git remote add origin https://github.com/Ranjeet7680/Celebration-Event-Planner.git
git push -u origin main
```

---

## 📄 License
MIT License. Crafted with precision for Google Antigravity.
