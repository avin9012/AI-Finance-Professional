# FinanceAI Pro — AI-Powered Financial Advisor

A full-stack AI-powered financial management web application built with Next.js 14, Google Gemini AI, and modern web technologies.

## ✨ Features

- **💰 Expense Tracking** — Smart categorization of your financial transactions
- **📊 Budget Analysis** — Real-time insights and custom financial recommendations  
- **📈 Investment Planning** — AI-driven strategies and portfolio insights
- **🤖 AI Chat Advisor** — Natural language financial guidance via Google Gemini
- **🔒 Secure Auth** — Clerk-powered authentication and data protection

## 🛠️ Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Hono.js** — Backend API routes
- **Drizzle ORM** + **Neon PostgreSQL**
- **Clerk** — Authentication
- **Google Gemini API** — AI chat
- **Shadcn UI** + **Tailwind CSS**
- **Recharts** — Data visualization
- **TanStack Query + Table**

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### 3. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Getting API Keys

| Service | Free Tier | Link |
|---------|-----------|------|
| Clerk Auth | ✅ Yes | [clerk.com](https://clerk.com) |
| Neon PostgreSQL | ✅ Yes | [neon.tech](https://neon.tech) |
| Google Gemini API | ✅ Yes | [aistudio.google.com](https://aistudio.google.com) |

## 📄 License

MIT License
