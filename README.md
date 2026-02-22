# 📚 Mini Library — Next.js Full-Stack

A full-stack Library Management System built with **Next.js 15**, **TypeScript**, **Prisma**, and **NextAuth.js v5**. Features AI-powered book search via Groq API.

## Features

- **Book Catalogue** — Browse, search, filter, and paginate books
- **AI Search** — Natural language search powered by Groq (LLaMA 3.3 70B)
- **Authentication** — Email/password + Google OAuth via NextAuth.js v5
- **Role-Based Access** — Admin, Librarian, and Member roles
- **Loan Management** — Borrow, checkout, checkin, loan history
- **Cover Image Upload** — File upload or URL for book covers
- **Responsive UI** — Custom CSS with animations, matching the original design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite (Prisma ORM) |
| Auth | NextAuth.js v5 (Auth.js) |
| AI | Groq API (llama-3.3-70b-versatile) |
| Styling | Tailwind CSS v4 + custom CSS |

## Getting Started

```bash
cd library-next
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Admin Account
- **Email:** `admin@library.local`
- **Password:** `Admin123!`

## Role Permissions

| Feature | Admin | Librarian | Member |
|---------|:-----:|:---------:|:------:|
| Browse books | ✅ | ✅ | ✅ |
| AI search | ✅ | ✅ | ✅ |
| Borrow a book | ✅ | ✅ | ✅ |
| My Loans | — | — | ✅ |
| Add/Edit/Delete books | ✅ | ✅ | — |
| Manage loans (checkout/checkin) | ✅ | ✅ | — |
| User management | ✅ | — | — |

## Project Structure

```
library-next/
├── prisma/              # Schema + seed data
├── src/
│   ├── app/             # Next.js App Router pages & API routes
│   │   ├── api/         # REST API endpoints
│   │   ├── books/       # Book CRUD pages
│   │   ├── loans/       # Loan management pages
│   │   ├── admin/       # Admin pages
│   │   ├── search/ai/   # AI search page
│   │   └── ...
│   ├── components/      # Reusable React components
│   ├── lib/             # Auth, Prisma, AI search, book search
│   └── types/           # TypeScript interfaces
└── public/uploads/      # Uploaded cover images
```
