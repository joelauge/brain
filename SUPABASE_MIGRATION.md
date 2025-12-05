# Supabase PostgreSQL Migration Guide

## Overview
This project has been migrated from SQLite to PostgreSQL using Supabase.

## Environment Variables

### For Local Development (.env.local)
Create or update `.env.local` with:

```bash
# Use the Prisma connection string (with pgbouncer for better performance)
DATABASE_URL="postgres://postgres.tzdkkqnorklatwvctvxk:K9gqLnpucs599NvR@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Supabase Client (optional, for future Supabase features)
NEXT_PUBLIC_SUPABASE_URL="https://tzdkkqnorklatwvctvxk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGtrcW5vcmtsYXR3dmN0dnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjM4ODksImV4cCI6MjA3NjczOTg4OX0.UhFtf--PIRjWmvh2cYEkA8XyuMXBu1cP8faO05BDC8g"
```

### For Vercel Deployment
Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `DATABASE_URL` = `postgres://postgres.tzdkkqnorklatwvctvxk:K9gqLnpucs599NvR@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`

**Optional (for future Supabase features):**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://tzdkkqnorklatwvctvxk.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZGtrcW5vcmtsYXR3dmN0dnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjM4ODksImV4cCI6MjA3NjczOTg4OX0.UhFtf--PIRjWmvh2cYEkA8XyuMXBu1cP8faO05BDC8g`

## Migration Steps

### 1. Local Setup
```bash
# Set DATABASE_URL in .env.local (see above)
# Then push schema to Supabase
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### 2. Vercel Setup
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with the connection string above
3. Redeploy the application

### 3. Verify Migration
```bash
# Check database status
npm run db:status

# Or use Prisma Studio to view data
npx prisma studio
```

## Connection String Notes

- **For Prisma/Application**: Use `POSTGRES_PRISMA_URL` (with `pgbouncer=true`) - better for serverless
- **For Migrations**: Use `POSTGRES_URL_NON_POOLING` (port 5432) - required for schema changes

The build command uses `prisma db push` which works with the pooled connection.

## Important Changes

1. **Schema Updated**: Changed from `provider = "sqlite"` to `provider = "postgresql"`
2. **Build Command**: Already includes `prisma db push` to sync schema on deployment
3. **No Code Changes**: All Prisma queries remain the same - Prisma handles the database differences

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Supabase dashboard for connection limits
- Ensure SSL mode is set to `require`

### Migration Errors
- Use non-pooling connection for migrations: `POSTGRES_URL_NON_POOLING`
- Run `npx prisma migrate dev` if using migrations instead of `db push`

### Type Errors
- Run `npx prisma generate` after schema changes
- Restart your dev server after generating Prisma client

