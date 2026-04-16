# SaaS-PMS (Pharmacy Management System)

A production-ready, multi-tenant Pharmacy Management SaaS built with **Next.js 15 (App Router)**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.

This project is tailored specifically for the **Nepal market**, integrating region-specific business logic such as FEFO inventory management, Nepal VAT calculation rules, and strict Department of Drug Administration (DDA) narcotic compliance.

---

## 📖 Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Database Schema](#database-schema)
- [Core Logic Implementations](#core-logic-implementations)
- [Local Setup & Installation](#local-setup--installation)

---

## ✨ Features

- **Multi-Tenant Architecture:** Built-in column-level multi-tenancy. Every core model tracks a `tenantId`, isolating data between different pharmacy branches or clients.
- **Strict Validation:** End-to-end type safety using TypeScript, `zod` for payload validation, and `react-hook-form` for UI state.
- **Smart POS UI:** A highly responsive Point of Sale terminal. It automatically flags inventory batches expiring within 6 months to minimize loss.
- **FEFO Inventory Allocation:** Enforces First-Expire-First-Out logic for drug batches.
- **Narcotic Compliance (Class A):** The API dynamically tracks and enforces the logging of Doctor NMC Numbers and Patient Phone Numbers before a narcotic invoice is permitted to generate.
- **Nepal VAT Calculator:** Automatically breaks down invoices into Taxable, Non-Taxable, and exact 13% VAT totals using Prisma's `Decimal` type to eliminate floating-point/NPR rounding errors.

---

## 🏗 Architecture & Tech Stack

- **Framework:** Next.js 15 (App Router / React Server Components)
- **Database:** PostgreSQL (via Docker Compose)
- **ORM:** Prisma v5
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **Date Utility:** `nepali-date-converter` (A.D. to B.S. conversion support)

The application separates concerns between:
1. **Server Actions (`/src/app/actions`)**: Secure, atomic business logic handling mutations.
2. **Utilities (`/src/utils`)**: Pure functions for VAT calculation, Date conversions, and sorting logic.
3. **UI Components (`/src/components`)**: Client-side interactive elements.

---

## 🗄 Database Schema

The database utilizes Prisma to model complex relationships securely.

Key models include:
- `Tenant`: Represents a single pharmacy entity.
- `TenantSettings`: Tracks sequences such as the `lastInvoiceNo` generated for a specific tenant.
- `Medicine`: Stores global drug metadata and DDA Class category.
- `StockBatch`: Represents a physical delivery of medicine with explicit `mfgDate`, `expDate`, and prices.
- `Invoice` & `InvoiceItem`: Records transactions natively supporting VAT toggles and Credit states.
- `NarcoticLog`: Automatically generated when an invoice contains a `CLASS_A` drug.

*Refer to `prisma/schema.prisma` for the exact schema definitions.*

---

## 🧠 Core Logic Implementations

### 1. Atomic Invoicing (`createInvoice` Server Action)
Located in `src/app/actions/invoice.ts`, this handles the entire checkout process in a single Prisma `$transaction`. If any step fails (e.g., stock runs out mid-transaction, or narcotic validation fails), the entire database rolls back, preventing corrupt accounting states.

### 2. FEFO Logic (`getAvailableStock`)
Located in `src/utils/fefo.ts`, this fetches available inventory for a specific medicine, filters out batches that have already expired, and orders them by nearest expiration date (`expDate: asc`).

### 3. Decimal VAT Calculation
Located in `src/utils/vatCalculator.ts`, this utility computes exact tax brackets. JavaScript's native floating-point math (`0.1 + 0.2 !== 0.3`) is dangerous for accounting. We utilize Prisma's `Decimal` type wrapper to execute precise mathematical operations for Grand Totals.

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** >= 18
- **Docker** and **Docker Compose** (for spinning up local PostgreSQL)

### 1. Install Dependencies
Run npm install in the terminal.

### 2. Configure Environment Variables
Copy the provided `.env.example` file to create your local `.env`.
*(The default `DATABASE_URL` connects directly to the local Docker container)*

### 3. Start the Database
Spin up the PostgreSQL database in the background:
docker compose up -d

### 4. Run Migrations & Seed Data
Push the schema to the database and populate it with mock data (Medicines, Tenants, and Stock Batches):
npx prisma db push
npx prisma db seed

### 5. Start the Development Server
Start the development server with standard Next.js npm script.

Open [http://localhost:3000](http://localhost:3000) to view the SaaS Landing Page. Click **"Launch POS Terminal"** to view the POS in action.
