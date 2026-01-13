# Quick Start Guide - PostgreSQL Migration

## What Changed?

Your Sunday School Dashboard now uses **PostgreSQL with Prisma** instead of MongoDB with Mongoose.

## Why PostgreSQL?

- ✅ Better for relational data (members ↔ attendance)
- ✅ Easier to deploy (Vercel Postgres, Neon, Supabase free tiers)
- ✅ Type-safe with Prisma
- ✅ Better performance for complex queries
- ✅ Industry standard with great tooling

## Setup Steps

### 1. Install PostgreSQL

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sunday_school;

# Exit
\q
```

### 3. Update Environment

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sunday_school?schema=public"
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Run Migrations

```bash
npm run prisma:migrate
```

This creates all tables automatically!

### 6. Start the Application

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend  
npm run dev
```

### 7. Create First User

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"password123"}'
```

## Useful Prisma Commands

```bash
# View database in browser
npm run prisma:studio

# Create a new migration after schema changes
npm run prisma:migrate

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npm run prisma:generate
```

## Deployment

**Easy Option: Railway**
- Free PostgreSQL included
- Auto-runs migrations
- One-click deploy

**Vercel + Vercel Postgres:**
- Create Postgres database in Vercel dashboard
- Deploy app
- Run migrations: `DATABASE_URL="prod_url" npm run prisma:migrate`

**Vercel + Neon (Free Tier):**
- Create database at neon.tech
- Copy connection string
- Add to Vercel environment variables
- Deploy!

## Need Help?

Check the full README.md for detailed instructions!
