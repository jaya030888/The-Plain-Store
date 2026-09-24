# The Plain Store

A premium full‑stack e‑commerce application with separate client, admin, and backend services.

## Architecture

- **client/** – React + Vite SPA (customer‑facing) deployed on Vercel.
- **admin/** – React + Vite SPA (admin portal) deployed on Vercel.
- **server/** – Node.js / Express API deployed on Render as a Web Service.
- **PostgreSQL** – Render‑hosted PostgreSQL database.

## Deployment URLs

- Backend API: https://the-plain-store.onrender.com
- Client (Vercel): <client‑vercel‑url>
- Admin (Vercel): <admin‑vercel‑url>

## Environment Variables

### Server (`server/.env.example`)
```
DATABASE_URL=
CLIENT_URL=
ADMIN_URL=
JWT_SECRET=
PORT=5000
```

### Client & Admin (`client/.env.example`, `admin/.env.example`)
```
VITE_API_URL=
```

## Database Migration

- Replaced `mysql2` with the `pg` driver.
- Implemented a **smart query wrapper** in `server/config/db.js` that translates MySQL‑style `?` placeholders to PostgreSQL `$1, $2…` and maps `insertId` / `affectedRows` to the shapes expected by the existing code.
- Created `database.postgres.sql`, a PostgreSQL‑compatible version of the original schema (tables, relationships, seed data).
- No controller files needed manual query changes – the wrapper handles conversion automatically.

## CORS Configuration

`server/server.js` now reads `process.env.CLIENT_URL` and `process.env.ADMIN_URL` (plus local dev ports) and only allows those origins, securing JWT cookie handling in production.

## Running Locally
```bash
# Backend (PostgreSQL)
cd server
npm install
# Create a .env with a local Postgres connection string, e.g.:
# DATABASE_URL=postgres://user:pass@localhost:5432/the_plain_store
npm run dev   # runs on http://localhost:5000

# Client
cd ../client
npm install
npm run dev   # VITE_API_URL defaults to http://localhost:5000

# Admin
cd ../admin
npm install
npm run dev   # VITE_API_URL defaults to http://localhost:5000

# Nginx Gateway & Route Protector (Port 8088)
# Start Nginx server (Windows native or Docker):
powershell -ExecutionPolicy Bypass -File .\start-nginx.ps1
# Or via Docker Compose:
docker compose -f docker-compose.nginx.yml up -d
```

## Production Workflow
1. Commit & push to GitHub – Render pulls the latest commit, installs `pg`, builds, and connects to the Render PostgreSQL instance via `DATABASE_URL`.
2. In Vercel, set `VITE_API_URL` (as a **Config** variable, not Secret) to `https://the-plain-store.onrender.com` for both client and admin projects and trigger a redeploy.
3. The three services now communicate securely without any hard‑coded `localhost` URLs.

## Notes
- No UI/UX changes were made; all existing designs, animations, and features remain intact.
- Secrets are excluded via `.gitignore`; only `.env.example` is version‑controlled.
- The backend now uses PostgreSQL, eliminating the previous MySQL connection error.


A full-stack, premium e-commerce application built with React, Node.js, Express, and MySQL.

## Project Architecture

The project is structured as a monorepo containing three distinct parts that share a single MySQL database:

- **`/client`**: The public-facing Customer website (React + Vite)
- **`/admin`**: The secure Admin Portal (React + Vite)
- **`/server`**: The unified REST API Backend (Node.js + Express)

## Features

### Customer Website (`/client`)
- Browse the complete live MySQL product catalog.
- Animated hero slider that cycles through up to four featured catalog products.
- Persistent Cart and Wishlist using MySQL (no local storage).
- Responsive boutique navbar with a visible brand logo, product search, account/location details, language, cart, and menu controls.
- Product details preserve the two-column desktop composition, stack cleanly on mobile, and provide an authenticated add/remove wishlist button that shares state with product-card
- Customer Account & Address Management.
- Real-time Checkout Flow with Razorpay Payment Gateway integration.
- Order History tracking.

### Admin Portal (`/admin`)
- Secure, Role-Based Access Control (RBAC) authentication.
- Dashboard with comprehensive real-time metrics (Revenue, Orders, Products, and Customers).
- Full CRUD management for:
  - Products (including setting "Featured" items for the hero slider)
  - Orders (update delivery statuses)
  - Categories
  - Coupons (with minimum orders and expiry dates)
  - Customers

### Backend API (`/server`)
- Express.js architecture with MySQL2.
- JWT Authentication and bcrypt password hashing.
- Razorpay Webhook & Signature Verification.
- Automated stock decrementing upon successful payment.

## How to Run Locally

You will need three separate terminal windows to run the full stack simultaneously.

### 1. Database Setup
1. Ensure MySQL is running on your machine.
2. The server is configured to connect to a database named `the_plain_store` by default.

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
*API runs on http://localhost:5000*

### 3. Start the Customer Website
```bash
cd client
npm install
npm run dev
```
*Customer App runs on http://localhost:5173 (or assigned Vite port)*

### 4. Start the Admin Portal
```bash
cd admin
npm install
npm run dev
```
*Admin App runs on http://localhost:5174 (or assigned Vite port)*

## Environment Variables
The `/server` folder requires an `.env` file with your Razorpay Keys and DB credentials.

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=the_plain_store
PORT=5000
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
