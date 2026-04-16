# SaaS-PMS (Pharmacy Management System)

A multi-tenant Pharmacy Management SaaS built with Next.js 15, Prisma ORM, PostgreSQL, and Tailwind CSS. Tailored for the Nepal market (includes FEFO stock, Nepal VAT calculator, and Narcotic drug compliance).

## Prerequisites

- Node.js >= 18
- Docker and Docker Compose (for local database)

## Quick Start Setup

### 1. Install Dependencies
Run npm install

### 2. Configure Environment
Copy the example environment file to create your own .env file.
The default DATABASE_URL in .env.example points to the local Docker database.

### 3. Start Local Database (PostgreSQL)
Use Docker Compose to spin up the local PostgreSQL instance.

### 4. Run Migrations and Seed Database
Once the database is running, push the Prisma schema and seed the initial mock data (Medicines, Batches, Tenants) using npx prisma db push and npx prisma db seed.

### 5. Start the Development Server
Start the Next.js development server using the standard npm script for starting dev.
Open [http://localhost:3000](http://localhost:3000) with your browser to see the POS Terminal UI.

## Features

- **Multi-Tenant Architecture:** Built-in schema support for scaling across multiple pharmacies.
- **Strict Validation:** Uses Zod and React Hook Form.
- **Smart POS UI:** Automatically flags batches expiring within 6 months.
- **FEFO Inventory:** Enforces First-Expire-First-Out logic for drug batches.
- **Narcotic Compliance:** Tracks Doctor NMC number and patient phone for Class A drugs.
- **Nepal VAT Calculator:** Automatically breaks down Taxable, Non-Taxable, and 13% VAT totals.
