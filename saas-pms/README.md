# SaaS-PMS (Pharmacy Management System)

A production-ready, multi-tenant Pharmacy Management SaaS built with **Next.js 15 (App Router)**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.

This project is tailored specifically for the **Nepal market**, integrating region-specific business logic such as FEFO inventory management, Nepal VAT calculation rules, and strict Department of Drug Administration (DDA) narcotic compliance.

---

## 📖 Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [One-Click Local Docker Setup (Recommended)](#one-click-local-docker-setup-recommended)
- [Authentication & Roles](#authentication--roles)
- [Database Schema](#database-schema)

---

## ✨ Features

- **Multi-Tenant Architecture:** Built-in column-level multi-tenancy. Every core model tracks a `tenantId`.
- **Authentication:** Protected routes and APIs using NextAuth.js (Credentials + Bcrypt).
- **Strict Validation:** End-to-end type safety using TypeScript, `zod` for payload validation, and `react-hook-form`.
- **Smart POS UI:** A highly responsive Point of Sale terminal. Flags inventory batches expiring within 6 months.
- **FEFO Inventory Allocation:** Enforces First-Expire-First-Out logic for drug batches.
- **Narcotic Compliance (Class A):** Enforces Doctor NMC Numbers and Patient Phone Numbers before a narcotic invoice is permitted.
- **Nepal VAT Calculator:** Breaks down invoices into Taxable, Non-Taxable, and 13% VAT totals using Prisma's `Decimal` type to prevent rounding errors.

---

## 🏗 Architecture & Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma v5
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS + Lucide React

---

## 🐳 One-Click Local Docker Setup (Recommended)

If you just want to test the application instantly without installing Node.js locally, you can use the all-in-one local Docker Compose environment.

This will automatically spin up PostgreSQL, run Prisma migrations, seed the mock data, and start the Next.js app.

### Instructions

1. **Start the environment:**
   Run the following command in the root of the repository:
   \`\`\`bash
   docker compose -f docker-compose.local.yml up --build
   \`\`\`

2. **Wait for the build:**
   The first run will take a few minutes as it downloads the Node image, installs dependencies, and pushes the database schema.

3. **Access the application:**
   Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication & Roles

The SaaS features two distinct permission levels. The `docker-compose.local.yml` seed script automatically provisions accounts for both.

### 1. Global Super Admin
**Controls the SaaS Infrastructure.** This role can access the restricted `/dashboard/superadmin` dashboard to register *new* Pharmacies (Tenants) and provision their initial Administrator accounts.
- **Email:** `superadmin@saaspms.com`
- **Password:** `superadmin123`

### 2. Pharmacy Admin
**Controls a single Pharmacy.** This role operates within their isolated `tenantId`. They have access to the POS Terminal, Inventory Management, and Sales Reports.
- **Email:** `admin@everest.com`
- **Password:** `admin123`

---

## 🗄 Database Schema

The database utilizes Prisma to model complex relationships securely.

Key models include:
- `Tenant`: Represents a single pharmacy entity.
- `User`: Authenticated users assigned to a specific Tenant.
- `Medicine`: Stores global drug metadata and DDA Class category.
- `StockBatch`: Represents a physical delivery of medicine with explicit `mfgDate`, `expDate`, and prices.
- `Invoice` & `InvoiceItem`: Records transactions natively supporting VAT toggles and Credit states.
- `NarcoticLog`: Automatically generated when an invoice contains a `CLASS_A` drug.
