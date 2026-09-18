# The Plain Store

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
- Product details preserve the two-column desktop composition, stack cleanly on mobile, and provide an authenticated add/remove wishlist button that shares state with product-card hearts.
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
