# Finance Dashboard UI

This is a frontend assignment project.  
It shows a clean finance dashboard where users can check balance, see transactions, and understand spending.

## What I Used

- Next.js (React framework)
- React + TypeScript
- Tailwind CSS
- Mock transaction data (no backend required)
- `localStorage` for saving data in browser

## How I Used These

- Next.js to build the app pages and structure.
- React components to split UI into small reusable parts like cards, charts, insights, and transaction table.
- TypeScript to keep data safe and avoid mistakes in transaction objects and filters.
- Tailwind CSS to create a responsive and clean design quickly.
- Mock data to simulate real finance activity (income and expense).
- `useReducer` to manage app state:
  - transactions
  - selected role
  - filters and sorting
  - edit mode for transaction form
- `localStorage` to keep user role and transaction changes after page refresh.

## Features Included

### Dashboard Overview

- Total Balance card
- Total Income card
- Total Expenses card
- Monthly balance trend chart (time-based)
- Spending breakdown by category (category-based)

### Transactions Section

- Transaction table with:
  - Date
  - Description
  - Category
  - Type (income/expense)
  - Amount
- Search support
- Filter by type
- Filter by category
- Sort by date or amount

### Role-Based UI (Frontend Simulation)

- Viewer role: can only see data
- Admin role: can add and edit transactions

### Insights Section

- Highest spending category
- Month-to-month expense comparison
- Savings rate observation

### UI/UX

- Works on desktop, tablet, and mobile
- Handles empty data and no-result filter states
- Simple animations for smooth feel

## Project Structure

- `app/page.tsx` -> main dashboard page
- `components/finance/finance-dashboard.tsx` -> main state and page flow
- `components/finance/summary-cards.tsx` -> top summary cards
- `components/finance/balance-trend-chart.tsx` -> trend chart
- `components/finance/spending-breakdown.tsx` -> category spending bars
- `components/finance/insights-panel.tsx` -> insights section
- `lib/finance.ts` -> types, mock data, helper functions

## Run This Project

1. Install packages:
   `npm install`
2. Run development server:
   `npm run dev`
3. Open in browser:
   `http://localhost:3000`

### Build for production

`npm run build`

### Type check

`npm run lint`

## Deploy on Netlify (Live)

1. Push this code to GitHub.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Select your GitHub repo: `Subamprasad/finance-dashboard-UI`.
4. Netlify build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
5. Click **Deploy site**.

After deploy, Netlify will give you a live URL.

## Important Note

This project is made for UI evaluation and frontend logic demonstration.  
No backend or database is required.
