# BookMyVenue 🏛️

> **A production-grade, full-stack venue booking platform** built with a domain-driven backend architecture. BookMyVenue enables customers to discover and book venues (hourly or multi-day), vendors to manage their listings and bookings, and administrators to oversee the entire platform — all in real-time.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Session%20%26%20PubSub-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment%20Gateway-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Backend — Domain-Driven Orchestration](#-backend--domain-driven-orchestration)
  - [Booking Lifecycle Engine](#1-booking-lifecycle-engine)
  - [Availability Engine](#2-availability-engine)
  - [Payment & Policy Engines](#3-payment--policy-engines)
  - [Event-Driven Notification System](#4-event-driven-notification-system)
  - [Authentication & Security](#5-authentication--security)
  - [Real-Time Layer](#6-real-time-layer)
  - [Automated Cron Jobs](#7-automated-cron-jobs)
  - [Wallet & Ledger System](#8-wallet--ledger-system)
- [Frontend Architecture](#-frontend-architecture)
- [Data Models](#-data-models)
- [API Overview](#-api-overview)
- [Key Design Patterns](#-key-design-patterns)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## 🎯 Project Overview

BookMyVenue is a multi-role SaaS platform connecting **customers**, **vendors**, and **administrators**. The platform handles the full lifecycle of a venue booking — from discovery and reservation to payment, confirmation, cancellation, and automated completion.

### Core Features by Role

| Role | Capabilities |
|---|---|
| **Customer** | Discover venues, hourly/daily booking, Razorpay checkout, wallet refunds, wishlist, booking history, real-time notifications |
| **Vendor** | Onboarding flow, venue creation & management, slot configuration, booking dashboard, balance payment requests, completion marking |
| **Admin** | Platform-wide dashboard, vendor & venue approval pipeline, category/subcategory management, booking oversight, wallet monitoring |

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache / Session | Redis (ioredis) |
| Authentication | JWT (Access + Refresh tokens) + Passport.js (Google OAuth 2.0) |
| Payment Gateway | Razorpay |
| Real-Time | Socket.IO + Redis Adapter (horizontally scalable) |
| File Uploads | Cloudinary + Multer |
| Email | Nodemailer |
| Scheduled Jobs | node-cron |
| Validation | Zod + express-validator |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router DOM v7 |
| State Management | React Context API |
| Forms | React Hook Form + Yup/Zod |
| Charts | Recharts |
| UI Notifications | Sonner (toast) |
| Icons | Lucide React + React Icons |
| Real-Time | Socket.IO Client |
| Styling | Tailwind CSS |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Customer │  │  Vendor  │  │  Admin   │  │Auth/Public │  │
│  │  Portal  │  │ Dashboard│  │ Console  │  │   Pages    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
└───────┼─────────────┼─────────────┼───────────────┼─────────┘
        │   REST API  │             │               │
        ▼             ▼             ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS API SERVER                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Auth Routes │ User Routes │ Vendor Routes │ Admin     │  │
│  │  Webhook     │ Customer    │ Notification  │ Wallet    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CORE SERVICE LAYER (Domain-Driven)          │ │
│  │  ┌──────────────────┐  ┌───────────────────────────┐   │ │
│  │  │BookingLifecycle  │  │   AvailabilityEngine      │   │ │
│  │  │  Orchestrator    │  │   AvailabilityValidator   │   │ │
│  │  └──────────────────┘  └───────────────────────────┘   │ │
│  │  ┌──────────────────┐  ┌───────────────────────────┐   │ │
│  │  │ PaymentPolicy    │  │  CancellationPolicy       │   │ │
│  │  │    Engine        │  │       Engine              │   │ │
│  │  └──────────────────┘  └───────────────────────────┘   │ │
│  │  ┌──────────────────┐  ┌───────────────────────────┐   │ │
│  │  │  RefundEngine    │  │  TransactionService       │   │ │
│  │  └──────────────────┘  └───────────────────────────┘   │ │
│  │  ┌──────────────────┐  ┌───────────────────────────┐   │ │
│  │  │BookingState      │  │  ReservationService       │   │ │
│  │  │  Machine         │  │  (10-min TTL sessions)    │   │ │
│  │  └──────────────────┘  └───────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  DomainEventBus (Node EventEmitter) → NotificationSub  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                       ▼
┌──────────────┐     ┌──────────────────┐    ┌────────────────┐
│   MongoDB    │     │  Redis           │    │   Cloudinary   │
│  (Primary    │     │  · Auth tokens   │    │  (Image CDN)   │
│   Database)  │     │  · Refresh sess. │    └────────────────┘
│              │     │  · Socket PubSub │
│  17 Models   │     └──────────────────┘
└──────────────┘
```

---

## ⚙️ Backend — Domain-Driven Orchestration

The backend is structured around a **domain-driven service layer** inside `server/src/services/core/`, implementing several well-known enterprise patterns to ensure correctness, atomicity, and maintainability.

### 1. Booking Lifecycle Engine

**File:** `server/src/services/core/BookingLifecycleOrchestrator.js`

The `BookingLifecycleOrchestrator` is the central orchestrator for all booking state transitions. It coordinates multiple domain services through a strict, atomic sequence using **MongoDB transactions** (sessions).

**Cancellation Flow (ACID Transaction):**
```
BookingLifecycleOrchestrator.cancel(context)
│
├── 1. _loadBooking()           → Fetch & validate booking exists
├── 2. _validateOwnership()     → Role-based access check (customer/vendor/admin)
├── 3. BookingStateMachine      → Validate legal state transition
│      .validateTransition()
├── 4. CancellationPolicyEngine → Time-based and status-based rules
│      .validate()
├── 5. RefundEngine.calculate() → Determine refundable amount & destination
│
│   ┌── MongoDB Session (START TRANSACTION) ──────────────────┐
├── 6. _processFinancials()     → Credit customer wallet (idempotent)
│      └── TransactionService  → Debit admin wallet (async, non-blocking)
├── 7. _updateBooking()         → Atomic status update with state-matching
│      └── findOneAndUpdate({ bookingStatus: {$in: ['pending','confirmed']} })
├── 8. _releaseAvailability()   → Release slot overrides
│   └── COMMIT / ABORT ────────────────────────────────────────┘
│
├── 9. _publishEvents()         → DomainEventBus (async, post-commit)
└── 10. AuditLogService.log()   → Full audit trail with IP & userAgent
```

**Completion Flow:**
- Validates vendor ownership
- Checks event has physically ended (timezone-aware IST comparison)
- Uses `findOneAndUpdate` with state matching to prevent race conditions
- Publishes `BOOKING_COMPLETED` domain event

### 2. Availability Engine

**Files:** `AvailabilityEngine.js`, `AvailabilityValidatorService.js`, `AvailabilityValidatorService.js`

A purely functional engine that generates real-time availability from venue operating hours and persisted override blocks.

**Key Capabilities:**
- **Hourly slot generation:** Computes available start times from `openTime` to `closeTime` minus booked blocks, respecting a configurable `bookingInterval`
- **Real-time cutoff:** Automatically filters out slots starting within 30 minutes of "now" for same-day bookings
- **End-time generation:** Given a start time, generates valid end times up until the next booked block
- **Daily range validation:** Checks multi-day booking ranges against full-day override blocks
- **Pre-session overlap protection:** Prevents double-booking before the session is even created, using `BookingSession` as a 10-minute pessimistic lock

### 3. Payment & Policy Engines

**Files:** `PaymentPolicyEngine.js`, `PricingEngineService.js`, `RefundEngine.js`

#### Payment Policy Engine
Applies business rules to determine payment structure at booking time:
- **Full Payment:** Required for all hourly bookings and daily bookings within 7 days of the event
- **Advance Payment:** For daily bookings >7 days out — collects a configurable percentage upfront, with the balance due before the cutoff date

```javascript
// Example output for a daily booking 14 days out
{
  paymentPolicy: 'advance_payment',
  advanceAmount: 5000,      // 50% upfront
  remainingAmount: 5000,    // Due 7 days before event
  balanceDueDate: Date,
  policyMetadata: { version, advancePercentage, fullPaymentThresholdDays }
}
```

#### Refund Engine
Calculates the refundable amount and destination (wallet vs. Razorpay) based on the booking's payment and policy status.

#### Pricing Engine
Computes total, hourly, and daily pricing from venue configuration and guest count.

### 4. Event-Driven Notification System

**Files:** `EventBus.js`, `notificationSubscriber.js`

A lightweight **pub/sub system** built on Node.js `EventEmitter`, decoupling the booking domain from the notification domain.

**Architecture:**
```
BookingLifecycleOrchestrator
  └── EventBus.publish('BookingCancelled', payload)
          │  (runs via setImmediate — non-blocking)
          ▼
  NotificationSubscriber
  └── EventBus.on('BookingCancelled', handler)
          └── notificationService.sendNotification(...)
                  └── Socket.IO → push to user's room
```

**10 Domain Events Handled:**

| Event | Recipients |
|---|---|
| `BookingConfirmed` | Customer + Vendor |
| `BookingCancelled` | Vendor (if customer cancelled) + Customer (if vendor cancelled) |
| `RefundProcessed` | Customer |
| `VendorApproved` | Vendor |
| `VenueStatusChanged` | Vendor |
| `PaymentFailed` | Customer |
| `BookingExpired` | Customer |
| `BalanceRequested` | Customer |
| `BalancePaid` | Vendor |
| `BookingCompleted` | Customer + Vendor |

### 5. Authentication & Security

**Files:** `authService.js`, `authMiddleware.js`, `passport.js`

- **JWT Dual-Token Strategy:** Short-lived access tokens (15 min) + long-lived refresh tokens (7 days) with **token rotation** on refresh
- **Redis-Backed Token Store:** All refresh tokens are stored in Redis with TTL; invalidation is instant and reliable
- **Google OAuth 2.0:** Full OAuth flow via Passport.js; new Google users choose their role (customer/vendor) before account creation
- **Email Verification:** JWT-based verification tokens stored in Redis with 15-minute TTL; single-use (deleted on use)
- **Password Reset:** Cryptographically secure reset flow with Redis-backed token invalidation
- **Manual Rollback on Failure:** If customer/vendor profile creation fails after user creation, the base user document is deleted to prevent orphaned records
- **Account State Guards:** Blocks login for unverified emails, blocked accounts, and wrong auth providers (e.g., Google account trying password login)

### 6. Real-Time Layer

**File:** `server/src/config/socket.js`

- **Socket.IO** with **Redis Pub/Sub Adapter** — horizontally scalable across multiple Node.js instances
- **JWT Authentication Middleware** on every socket connection (supports both `handshake.auth.token` and HTTP-only cookies)
- **Per-user rooms:** Each socket joins a room keyed to `socket.userId`, enabling targeted push notifications to all of a user's active tabs/devices

### 7. Automated Cron Jobs

**File:** `server/src/cron/bookingCron.js`

Runs daily at **02:00 AM** to auto-complete all past confirmed bookings that vendors haven't manually completed. This ensures the booking lifecycle is always closed out and triggers completion notifications for both customer and vendor.

### 8. Wallet & Ledger System

**Files:** `walletModel.js`, `walletTransactionModel.js`, `walletRepository.js`, `TransactionService.js`

A double-entry-style wallet system for customers and the platform admin:

- **Customer Wallet:** Receives instant refunds on cancellation; can be used as payment towards new bookings (hybrid payment)
- **Admin Wallet:** Receives credits on every booking payment; debited when issuing customer refunds — providing a real-time P&L ledger
- **Idempotency Keys:** Every wallet transaction is keyed (e.g., `REFUND:{bookingId}:wallet`) to prevent duplicate processing in retry scenarios (catches MongoDB `11000` duplicate key errors)

---

## 💻 Frontend Architecture

The React frontend follows a **role-based, layout-driven** architecture with protected routing.

```
client/src/
├── App.jsx              # Root router with role-based protection
├── routes/
│   ├── ProtectedRoute   # Role-aware guard (ROLES.CUSTOMER, ROLES.VENDOR)
│   ├── PublicRoute      # Redirects logged-in users away from auth pages
│   ├── AuthRedirect     # Post-OAuth role-detection redirect
│   ├── UserRoutes       # Public venue discovery + landing page
│   ├── VendorRoutes     # Vendor dashboard sub-router
│   └── AdminRoutes      # Admin console sub-router
├── layouts/
│   └── DashboardLayout  # Shared sidebar layout (customer + vendor)
├── pages/
│   ├── customer/        # Bookings, Wishlist, Profile, Transactions, Wallet
│   ├── vendor/          # Dashboard, Venue Management, Bookings, Profile
│   ├── admin/           # Full admin console (12 pages)
│   └── vendor-onboarding/  # Multi-step vendor onboarding flow
├── store/
│   ├── AuthContext      # Global auth state (JWT, role, user profile)
│   └── BookingContext   # Active booking session state
├── api/                 # Axios instance + per-domain API modules
├── hooks/               # Custom React hooks
├── components/          # Reusable UI components (17 directories)
└── services/            # Client-side business logic (socket, etc.)
```

### Key Frontend Screens

| Area | Pages |
|---|---|
| Public | Landing page, Venue discovery, Venue detail |
| Auth | Login, Signup (role selection), OTP verify, Google OAuth, Forgot/Reset password |
| Customer | Bookings (with payment flow), Wishlist, Profile, Wallet, Transactions |
| Vendor | Dashboard, Add Venue (multi-step), Venue Management, Booking Dashboard, Profile, Application Status |
| Admin | Dashboard (analytics), Vendor Management, Venue Management, Booking Management, Category Management, Client Management, Wallet, Detail pages |

---

## 🗄 Data Models

17 Mongoose models covering the full domain:

| Model | Purpose |
|---|---|
| `User` | Base auth document (email, password, role, OAuth fields) |
| `Customer` | Customer profile (name, phone, avatar) — ref: User |
| `Vendor` | Vendor profile (name, phone, business info) — ref: User |
| `Admin` | Admin profile — ref: User |
| `Venue` | Full venue schema (location, capacity, pricing, booking config, operating hours, approval workflow) |
| `Category` / `Subcategory` | Venue categorization hierarchy |
| `Booking` | Confirmed booking with pricing, payment, timeline, cancellation |
| `BookingSession` | 10-minute TTL reservation lock (prevents double-booking during checkout) |
| `AvailabilityOverride` | Per-date slot blocks and full-day blocks |
| `Payment` / `PaymentRecord` | Razorpay payment tracking |
| `Wallet` | Balance ledger per user (customer/vendor/admin) |
| `WalletTransaction` | Immutable ledger entries with idempotency keys |
| `Notification` | Persisted notification records |
| `Review` | Venue reviews (rating + comment) |
| `Wishlist` | Customer saved venues |

---

## 🔌 API Overview

| Prefix | Description |
|---|---|
| `POST /api/auth/*` | Registration, login, email verify, password reset, Google OAuth, token refresh |
| `GET /api/home` | Landing page data (featured venues, categories) |
| `GET /api/venues/*` | Public venue discovery & detail |
| `POST /api/customer/*` | Customer-specific bookings, wishlist, reviews |
| `POST /api/vendor/*` | Venue CRUD, slot management, vendor bookings, profile |
| `GET/POST /api/admin/*` | Full admin operations (vendors, venues, users, categories, bookings) |
| `GET/POST /api/wallet/*` | Wallet balance & transactions |
| `POST /api/webhooks/*` | Razorpay webhook (HMAC signature verified) |
| `GET /api/notifications/*` | Notification feed |

---

## 🎨 Key Design Patterns

| Pattern | Where Used |
|---|---|
| **Orchestrator Pattern** | `BookingLifecycleOrchestrator` — single entry point for all booking state changes |
| **State Machine** | `BookingStateMachine` — enforces legal status transitions (prevents cancelling a completed booking) |
| **Domain Event Bus** | `EventBus` (pub/sub) — decouples booking domain from notification domain |
| **Repository Pattern** | `*Repository.js` files — abstracts all Mongoose queries away from services |
| **DTO (Data Transfer Object)** | `server/src/dto/booking/` — shapes data returned to clients (role-aware masking) |
| **Policy Engine** | `CancellationPolicyEngine`, `PaymentPolicyEngine` — pure business rules as isolated classes |
| **Idempotency Keys** | `WalletTransaction` — prevents duplicate financial operations on retries |
| **Pessimistic Locking** | `BookingSession` with TTL — holds a reservation lock during checkout |
| **ACID Transactions** | `mongoose.startSession()` — atomically updates booking status + wallet + availability |
| **Atomic State Matching** | `findOneAndUpdate({ bookingStatus: {$in: [...]} })` — prevents race conditions |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Cloudinary account
- Razorpay account
- Google OAuth credentials (optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JithuSudharshan/BookMyVenue.git
cd BookMyVenue

# 2. Install root dependencies
npm install

# 3. Install server dependencies
cd server && npm install

# 4. Install client dependencies
cd ../client && npm install
```

### Running Locally

```bash
# Terminal 1 — Start backend
cd server
cp .env.example .env    # Fill in your environment variables
npm run dev             # Starts on http://localhost:5001

# Terminal 2 — Start frontend
cd client
cp .env.example .env
npm run dev             # Starts on http://localhost:5173
```

### Seed the Database

```bash
# From /server
node seed.js         # Seeds categories, subcategories, sample venues
node adminSeed.js    # Creates the admin user
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
# App
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/bookmyvenue

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_SECRET=your_admin_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 📁 Project Structure

```
BookMyVenue/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── api/                # Axios API modules
│       ├── components/         # 17 reusable component directories
│       ├── hooks/              # Custom React hooks
│       ├── layouts/            # Shared page layouts
│       ├── pages/              # Route-level page components
│       │   ├── admin/          # 12 admin console pages
│       │   ├── customer/       # 5 customer portal pages
│       │   ├── vendor/         # 7 vendor dashboard pages
│       │   └── vendor-onboarding/
│       ├── routes/             # Protected & public route guards
│       ├── services/           # Client-side services (socket)
│       ├── store/              # React Context (Auth, Booking)
│       ├── utils/              # Constants, helpers
│       └── validations/        # Form validation schemas
│
└── server/                     # Express.js backend (ESM)
    └── src/
        ├── config/             # DB, Redis, Socket, Passport, Razorpay, Cloudinary
        ├── controllers/        # Request handlers (thin layer)
        ├── cron/               # Scheduled jobs (booking auto-completion)
        ├── dto/                # Data Transfer Objects (role-aware response shaping)
        ├── middlewares/        # Auth, error handler, rate limiter, upload, formatter
        ├── models/             # 17 Mongoose schemas
        ├── repositories/       # Data access layer (DB abstraction)
        ├── routes/             # Express routers (admin/, user/, vendor/)
        ├── services/
        │   ├── core/           # 17 domain service files (orchestrators, engines)
        │   ├── admin/          # 8 admin service files
        │   └── vendor/         # 4 vendor service files
        ├── subscribers/        # Domain event subscribers (notifications)
        ├── utils/              # AppError, EventBus, date utils, email, etc.
        └── validators/         # Zod/express-validator schemas
```

---

## 👨‍💻 Author

**Jithu Sudharshan**
- Built with a focus on production-grade backend architecture, clean code, and real-world business logic
- Demonstrates: Domain-Driven Design, ACID transactions, event-driven architecture, real-time systems, and secure payment integration

---

*Built as a full-stack portfolio project to demonstrate enterprise-level Node.js backend engineering.*
