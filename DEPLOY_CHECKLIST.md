# Pre-Deployment Checklist

## ⚠️ CRITICAL: Hosting Platform Check

**Before deploying, confirm your hosting platform:**

- [ ] **If using GitHub Pages**: API routes will NOT work. You need to:
  - Deploy to Vercel/Netlify/Railway instead, OR
  - Use a separate API server for the upload endpoints

- [ ] **If using Vercel**: ✅ Perfect! API routes will work automatically.

- [ ] **If using another platform**: Verify it supports Next.js API routes.

## Pre-Deployment Steps

### 1. Test Locally First
```bash
# Test the upload page
npm run dev
# Visit http://localhost:3000/fileuploads
# Upload a test XML file
# Verify it appears in public/uploads/xml/

# Test the automation API
curl -X POST http://localhost:3000/api/upload/automation \
  -H "X-API-Key: test-key" \
  -F "file=@test.xml"
```

### 2. Set Environment Variables

**Required for production:**
- [ ] `UPLOAD_API_KEY` - Set a strong, unique API key
- [ ] `RESEND_API_KEY` - Your Resend email API key
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `DATABASE_URL` - Your database connection string
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://brainmediaconsulting.com)

### 3. Review Changes

**New files to deploy:**
- [x] `app/api/upload/route.ts` - Web upload API
- [x] `app/api/upload/automation/route.ts` - N8N automation API
- [x] `app/fileuploads/page.tsx` - Upload page
- [x] `docs/UPLOAD_API.md` - API documentation
- [x] `DEPLOYMENT.md` - Deployment guide

**Modified files:**
- [x] `.gitignore` - Added `/public/uploads/` exclusion

### 4. Safe Deployment Strategy

**Option A: Deploy to Vercel (Recommended)**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy (automatic on push to main)

**Option B: Test Branch First**
1. Create a `staging` branch
2. Deploy staging branch first
3. Test thoroughly
4. Merge to main when ready

**Option C: Feature Flag (Advanced)**
- Add feature flag to enable/disable upload feature
- Deploy with feature disabled
- Enable after verification

## Post-Deployment Verification

After deployment, verify:

1. **Upload Page Works**
   - [ ] Visit `/fileuploads`
   - [ ] Upload a test XML file
   - [ ] Verify file is accessible at `/uploads/xml/[filename].xml`

2. **Automation API Works**
   - [ ] Test with curl or N8N
   - [ ] Verify API key authentication works
   - [ ] Check file is saved correctly

3. **Existing Site Still Works**
   - [ ] Homepage loads
   - [ ] Other pages work
   - [ ] No broken links
   - [ ] No console errors

## Rollback Plan

If something breaks:

1. **Vercel**: Use "Redeploy" to previous version
2. **Git**: Revert the commit: `git revert HEAD`
3. **Environment**: Check all env vars are set correctly

## Emergency Contacts

- Check deployment logs in hosting platform
- Review error logs
- Test locally to isolate issues

