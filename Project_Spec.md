# 💰 Expensora Web
## Modern React Frontend for Expensora Personal Finance System

---

# 📌 1. Overview

Expensora Web is a modern, responsive, single-page application (SPA) built using React and TypeScript.

It communicates with the Expensora API (Spring Boot backend) using secure JWT-based authentication.

The application must have:

- Modern fintech-style UI
- Dark mode by default
- Smooth animations
- Fully responsive design
- Clean and modular architecture
- Production-ready structure

---

# 🧰 2. Technology Stack

## Core
- React (Vite)
- TypeScript
- React Router v6+
- Axios

## Styling
- Tailwind CSS
- Modern UI component system (e.g., ShadCN-inspired components)
- Dark mode support (default enabled)

## State Management
- Context API or Zustand

## Forms & Validation
- React Hook Form
- Zod validation

## Charts
- Recharts

## UX Enhancements
- Toast notifications
- Skeleton loaders
- Modal dialogs
- Smooth transitions
- Animated charts

---

# 🏗 3. Application Architecture
src/
├── api/
├── assets/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── store/
├── types/
├── utils/
└── App.tsx

### Folder Responsibilities

- api → Axios instance and API services
- components → Reusable UI components
- features → Feature-based modules (expenses, income, auth)
- hooks → Custom hooks
- layouts → Main layout structures
- pages → Route-level pages
- routes → Protected routing logic
- store → Global state
- types → TypeScript interfaces
- utils → Helper utilities

---

# 🎨 4. UI/UX Design Requirements

The UI must be:

- Dark mode by default
- Card-based layout
- Rounded corners (rounded-2xl)
- Soft shadows
- Glassmorphism accents
- Clean spacing
- Minimal clutter
- Professional fintech appearance

### Layout

- Collapsible sidebar
- Top navbar
- Content container
- Responsive mobile layout

### Visual Style

- Smooth transitions (200–300ms)
- Hover effects
- Subtle gradient accents
- Animated loading states
- Skeleton screens
- Toast notifications

---

# 🧭 5. Core Pages

---

## 🔐 Authentication Pages

### Login Page
- Email
- Password
- Remember me
- Error handling
- Form validation
- Loading state

### Register Page
- Name
- Email
- Password
- Confirm password
- Validation feedback

---

## 📊 Dashboard Page

Must display:

- Total income (current month)
- Total expenses (current month)
- Net savings
- Savings percentage
- Category expense breakdown (Pie chart)
- Monthly trend (Line chart)
- Budget progress bars
- Top spending category
- Recent transactions list

All data fetched from API.

---

## 💸 Expenses Page

Features:

- Add expense modal
- Edit expense
- Delete expense
- Bulk delete
- Filter by:
  - Date range
  - Category
  - Amount range
- Search bar
- Pagination
- Sorting
- Tag display

Table must be modern and responsive.

---

## 💵 Income Page

Features:

- Add income modal
- Edit income
- Delete income
- Monthly summary
- Pagination
- Filtering

---

## 🎯 Budget Page

Features:

- Set monthly budget per category
- Set total monthly budget
- Display progress bars
- Show warning at 80%
- Show alert at 100%
- Budget history view

---

## 📈 Reports Page

- Export CSV
- Monthly summary cards
- Comparison analytics
- Download button

---

## 👤 Profile Page

- Update name
- Change password
- Logout
- Theme preference toggle
- Account details

---

# 🔒 6. Authentication Flow

- JWT stored securely (prefer memory or httpOnly cookies if backend supports)
- Axios interceptor attaches token
- Protected routes using PrivateRoute wrapper
- Automatic redirect on token expiry
- Logout clears state

---

# 🔁 7. Global Components

Must implement:

- Sidebar
- Navbar
- Card component
- Button component
- Input component
- Modal component
- Confirm dialog
- Toast system
- Skeleton loader
- Chart wrapper
- Pagination component
- Filter panel component

All reusable and generic.

---

# 📦 8. API Layer

Create centralized Axios instance:

- Base URL from environment variable
- Request interceptor
- Response interceptor
- Global error handling
- Token injection

API services must be separated by feature:

- authService
- expenseService
- incomeService
- dashboardService
- budgetService

---

# 🧠 9. State Management

Global state must handle:

- Auth user
- JWT token
- Theme mode
- Notifications

Feature state handled locally where possible.

---

# 📊 10. Data Visualization

Use Recharts for:

- Pie chart (category breakdown)
- Line chart (monthly trend)
- Bar chart (year comparison)
- Budget progress indicators

Charts must be animated.

---

# 🛡 11. Security Requirements

- No token in localStorage if avoidable
- Validate all form inputs
- Handle API errors gracefully
- Protect routes
- No sensitive data in logs
- Environment-based API config

---

# 🚀 12. Performance Optimization

- Lazy loading routes
- Code splitting
- Memoization where needed
- Debounced search
- Efficient re-renders
- Optimized list rendering

---

# 📱 13. Responsive Requirements

- Fully responsive
- Sidebar collapses on mobile
- Touch-friendly controls
- Chart resizing support
- Table scrollable on small screens

---

# 🧪 14. Code Quality Standards

- Strict TypeScript typing
- No any types
- Modular components
- Reusable UI primitives
- Proper naming conventions
- Clean folder structure

---

# 🎯 15. Deployment Constraints

Must deploy using:

Frontend → Vercel (Free Plan)
Backend → Render (Free Plan)

Environment variables:

VITE_API_BASE_URL

Production build must succeed without warnings.

---

# 📦 16. Non-Functional Requirements

- Clean architecture
- Maintainable codebase
- Scalable structure
- Modern UI
- Smooth UX
- Production-ready

---

# 🎯 Final Goal

Expensora Web must look like a real fintech SaaS product.

It should demonstrate:

- Modern React architecture
- Secure API integration
- Advanced UI design
- Data visualization
- Clean modular structure
- Professional quality

This is not a basic CRUD app.
This is a production-style frontend system.
