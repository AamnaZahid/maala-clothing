# Maala Clothing — E-Commerce Monorepo

Online shop for **Maala Clothing**, a home-based clothing business in Mian Channu, Pakistan.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Java 17, Spring Boot 3.2, JPA, JWT |
| Frontend | React 18, Vite, Tailwind CSS        |
| Database | H2 (dev) / PostgreSQL (prod)        |

## Quick Start (Local)

### Option A — Double-click (Windows)

1. Double-click **`start-backend.cmd`** — wait until you see "Started MaalaShopApplication"
2. Double-click **`start-frontend.cmd`** — opens the shop at http://localhost:5173

### Option B — Terminal commands

**Backend** (use `mvnw.cmd` — no global Maven install needed):

```bash
cd backend
set SPRING_PROFILES_ACTIVE=dev
.\mvnw.cmd spring-boot:run
```

Or double-click **`start-backend.cmd`** (sets dev profile automatically).

**Frontend** (if `npm` fails in PowerShell, use `npm.cmd`):

```bash
cd frontend
npm.cmd install
npm.cmd run dev
```

## Pre-configured for Maala Clothing

- Shop name: **Maala Clothing**
- WhatsApp orders: **03094094776** (API format: `923094094776`)
- Seed payment accounts use your number
- Leopard Courier delivery: PKR 250 (all orders)

## Project Structure

```
/backend   → Spring Boot API
/frontend  → React customer shop + admin panel
DEPLOYMENT.md → Free hosting guide (GitHub Pages + Render + Supabase)
```

## Features

- Guest checkout with advance payment (EasyPaisa / JazzCash / Bank Transfer)
- WhatsApp order alerts via CallMeBot
- Admin panel: products, orders, categories, settings
- Order tracking by order number + phone
- Mobile-first responsive design

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full free deployment instructions.
