# Mini Library

A library management system where users can browse books, borrow them, and search using AI. Built with Next.js, TypeScript, and Prisma.

## What It Does

- **Browse Books** — View all books in the library with search, category filters, and pagination
- **Borrow Books** — Logged-in members can borrow available books directly from the book detail page
- **AI Search** — Type a natural language query like "science fiction books by Asimov" and the AI figures out what you're looking for (powered by Groq / LLaMA 3.3)
- **User Accounts** — Register with email/password or sign in with Google
- **Role-Based Access** — Three roles with different permissions:
  - **Member** — Can browse books, borrow, and view their own loans
  - **Librarian** — Can manage books (create, edit, delete), check out loans to members, and check in returns
  - **Admin** — Everything a Librarian can do, plus manage user roles
- **Loan Management** — Staff can check out books to any member, check them back in, and view the full loan history for each book

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Framework      | Next.js 15 (App Router)               |
| Language       | TypeScript                            |
| Database       | SQLite (via Prisma ORM)               |
| Authentication | NextAuth.js v5 (Credentials + Google) |
| AI Search      | Groq API (LLaMA 3.3 70B)             |
| Styling        | Tailwind CSS v4 + custom CSS          |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AdamMerhy/Library-Management-System.git
cd Library-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root (or edit the existing one):

```env
DATABASE_URL="file:./dev.db"

AUTH_SECRET="any-random-string-here"
AUTH_URL="http://localhost:3000"

# Google OAuth (optional — skip if you only want email/password login)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Groq AI Search (optional — AI search falls back to keyword search without this)
GROQ_API_KEY="your-groq-api-key"
```

**Where to get the keys:**

- **Google OAuth** — [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Create an OAuth 2.0 Client and add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
- **Groq API** — [Groq Console](https://console.groq.com/keys). Create a free API key.

### 4. Set up the database

```bash
npx prisma db push
```

This creates the SQLite database and all the tables.

### 5. Seed sample books (optional)

```bash
npm run db:seed
```

Adds ~13 books across different categories (Fiction, Science, History, Fantasy, etc.) so you have something to browse right away.

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── prisma/
│   ├── schema.prisma        # Database models (User, Book, Loan, Account)
│   └── seed.ts              # Sample book data
├── src/
│   ├── app/                  # All pages and API routes (Next.js App Router)
│   │   ├── page.tsx          # Home page
│   │   ├── books/            # Book list, detail, create, edit, delete pages
│   │   ├── loans/            # Loan management (checkout, checkin, history)
│   │   ├── my-loans/         # Member's personal loan view
│   │   ├── search/ai/        # AI-powered search page
│   │   ├── admin/users/      # Admin user management
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── api/              # API routes (auth, books, loans)
│   ├── components/           # Shared components (Navbar, BookCard, BookForm)
│   ├── lib/                  # Server-side logic (auth, prisma, AI search, book search)
│   ├── middleware.ts         # Route protection (redirects unauthorized users)
│   └── types/                # TypeScript type definitions
├── .env                      # Environment variables
└── package.json
```

## Available Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server on localhost:3000     |
| `npm run build`     | Build for production                      |
| `npm run start`     | Run the production build                  |
| `npx prisma studio` | Open a visual database browser            |
| `npm run db:seed`   | Seed the database with sample books       |
| `npm run db:push`   | Sync the Prisma schema to the database    |