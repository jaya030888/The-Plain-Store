# Progress Summary: The Plain Store

This document outlines all the development work completed so far on the project.

## 1. UI Refinements & Aesthetics
- **Hero Slider Enhancements**: Removed entrance animations for a cleaner aesthetic. Replaced text-based indicators with intuitive side arrows and bottom dots. Hero images are now clickable and navigate directly to product details.
- **Navbar Updates**: Updated the logo color to match the brand's teal (`#468165`). Added a Language Switcher (Globe icon + "EN").
- **Product Details Page**: Refactored the layout from inline styles to semantic CSS classes (`pd-container`, `pd-grid`), implementing a premium 2-column responsive grid layout.
- **Urgent storefront UI fix**: Restored a clean, single-row responsive navbar with a fully visible logo, bounded greeting/location area, aligned search, language, cart, and menu controls. The layout now reduces safely on tablet/mobile without horizontal overflow.
- **Product details polish**: Tuned the existing two-column desktop layout and its responsive stack so product imagery, description, and actions remain comfortably visible. Cart and wishlist actions now share the original rounded button language instead of introducing a separate style.
- **Storefront regression repair**: Restored the original homepage structure: the animated GSAP slider loads up to four products from `/api/products/featured`, followed by the real product catalog from `/api/products` with genuine loading and error states.
- **Temporary catalog simplification**: Removed the visible storefront search, category, price, and sorting controls at the customer's request. The home page now renders the complete API product list directly below the hero slider.
- **Live API verification & run script**: Verified `/api/products` returns 7 MySQL products and `/api/products/featured` returns 4 featured products. Added the missing server `start` and `dev` scripts so the documented `npm run dev` command starts the API correctly.

## 2. Global State & Features
- **Wishlist System**: 
  - Uses the existing `WishlistContext.jsx` and authenticated backend wishlist API; no second storage system was added.
  - Product cards and product details share the same immediate heart-state toggle.
  - Product details now exposes a clear `Add to Wishlist` / `In Wishlist` action. Guests are sent to login with a return path back to the relevant product.
- **Navigation Enhancements**: Expanded the mobile hamburger menu to include links for "Returns & Refunds", "My Orders", and "Wishlist".

## 3. Full-Stack Architecture Restructure
The project was completely reorganized from a simple prototype into a robust multi-tier architecture:

### A. Folder Organization
- **`/client`**: The existing customer-facing React application was moved here.
- **`/admin`**: A brand new React application was bootstrapped here for the secure admin portal.
- **`/server`**: The unified Node.js/Express backend powering both frontends.

### B. Backend API & Database (`/server`)
- Connected the backend to the `the_plain_store` MySQL database.
- Implemented **JWT Authentication** and **bcrypt** password hashing.
- Established **Role-Based Access Control (RBAC)** middleware to strictly protect admin-only routes.
- Updated the database schema to include an `is_featured` column for products.
- Created robust API endpoints:
  - Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
  - Products: `/api/products` (GET all), `/api/products/featured` (GET featured), plus admin CRUD operations (POST, PUT, DELETE).

### C. Customer Application Integration (`/client`)
- Created `AuthContext.jsx` for global authentication state.
- Built bespoke `/login` and `/register` pages adhering to the brand's premium design language.
- Implemented route protection: users attempting to Add to Cart or Add to Wishlist are now securely redirected to `/login` if unauthenticated.
- The Navbar dynamically renders user greetings or Login/Register links based on auth state.
- **Dynamic Data**: The Home page fetches real products from the MySQL-backed API for the catalog and separately fetches up to four featured products for the animated hero slider.

### D. Admin Dashboard Integration (`/admin`)
- Built a separate `AuthContext.jsx` specifically for admin token management.
- Created a secure `/admin/login` page (no registration allowed).
- Built the `AdminLayout.jsx` featuring a sidebar navigation and top header.
- Created the `AdminDashboard.jsx` for high-level metrics.
- Developed `ProductsManager.jsx` with full CRUD (Add, Edit, Delete) capabilities.
- Developed `OrdersManager.jsx` to view customer orders and update delivery statuses.
- Developed `CategoriesManager.jsx` and `CouponsManager.jsx` for catalog and discount management.
- Developed `CustomersManager.jsx` to track registered users and their spending.
- The `AdminDashboard.jsx` now pulls real-time analytics from the database (Total Revenue, Total Orders, Pending Orders, Total Products, Low Stock Products, Total Customers).

### E. E-commerce Backbone Integration
- **Real Checkout & Razorpay Integration**: Rebuilt the entire checkout flow inside a wizard modal. Customers can select saved addresses, apply server-validated coupons, and complete payments seamlessly using the Razorpay gateway.
- **My Orders**: Built `/orders` and `/orders/:id` for customers to track their order statuses and history.
- **Storefront Filters (API Only)**: The backend API supports robust filtering (Search, Category, Price Range, Sorting), though the UI controls are currently hidden for catalog simplification.
- **Context API Overhaul**: Rewrote `CartContext` and `WishlistContext` to sync securely with the MySQL backend using JWT tokens instead of `localStorage`.
- **Address Management**: Built a new `/profile` page where logged-in users can manage their shipping addresses.
## 4. How to Run & Access the Applications

Because the project is now split into three separate applications, you need to run them in three separate terminal windows.

### A. Start the Backend Server
1. Open a new terminal.
2. Navigate to the server folder: `cd server`
3. Start the API: `npm run dev`
- **Server API URL**: `http://localhost:5000`

### B. Start the Customer Website
1. Open a new terminal.
2. Navigate to the client folder: `cd client`
3. Start the React app: `npm run dev`
- **Customer Website URL**: `http://localhost:5173` (or the port Vite assigns)

### C. Start the Admin Portal
1. Open a new terminal.
2. Navigate to the admin folder: `cd admin`
3. Start the React app: `npm run dev`
- **Admin Portal URL**: `http://localhost:5174` (or the port Vite assigns)
- **Admin Login Route**: `/admin/login`
