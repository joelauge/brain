# Deployment Guide

## ⚠️ Important: GitHub Pages Limitation

**GitHub Pages only supports static sites.** Your Next.js app has API routes (`/api/upload`, `/api/upload/automation`) that require a Node.js server and **will not work on GitHub Pages**.

## Recommended Solution: Deploy to Vercel

Vercel is the recommended platform for Next.js apps and supports:
- ✅ API Routes (serverless functions)
- ✅ Automatic deployments from GitHub
- ✅ Environment variables
- ✅ Free tier with generous limits

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository: `joelauge/brain`
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```
   UPLOAD_API_KEY=your-secret-api-key-here
   RESEND_API_KEY=your-resend-key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   CLERK_SECRET_KEY=your-clerk-secret
   DATABASE_URL=your-database-url
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to `main`
   - Or click "Deploy" in the dashboard

4. **Update Domain** (if needed)
   - Add your custom domain in Vercel settings
   - Update DNS records as instructed

### Option 2: Keep GitHub Pages + Separate API Server

If you must keep GitHub Pages for the frontend:

1. **Deploy API routes separately** to:
   - Vercel (just the API routes)
   - Railway
   - Render
   - Or any Node.js hosting

2. **Update API URLs** in your frontend to point to the API server

3. **Deploy static frontend** to GitHub Pages using `next export`

## Pre-Deployment Checklist

### ✅ Before Deploying

- [ ] Test file upload locally
- [ ] Test automation API with N8N locally
- [ ] Set `UPLOAD_API_KEY` environment variable
- [ ] Verify all environment variables are set
- [ ] Test the `/fileuploads` page
- [ ] Ensure `public/uploads/xml/` directory exists (will be created automatically)

### ✅ Files to Deploy

**New Files:**
- `app/api/upload/route.ts` ✅
- `app/api/upload/automation/route.ts` ✅
- `app/fileuploads/page.tsx` ✅
- `docs/UPLOAD_API.md` ✅

**Modified Files:**
- `.gitignore` (added `/public/uploads/`) ✅

### ✅ Environment Variables Required

```bash
# Required for automation API
UPLOAD_API_KEY=your-secret-api-key-here

# Existing variables (make sure these are set)
RESEND_API_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Testing After Deployment

1. **Test Web Upload**
   - Visit: `https://your-domain.com/fileuploads`
   - Upload a test XML file
   - Verify it's accessible at `/uploads/xml/[filename].xml`

2. **Test Automation API**
   ```bash
   curl -X POST https://your-domain.com/api/upload/automation \
     -H "X-API-Key: your-secret-api-key" \
     -F "file=@test.xml"
   ```

3. **Test N8N Integration**
   - Configure N8N HTTP Request node
   - Use: `https://your-domain.com/api/upload/automation`
   - Test upload workflow

## Rollback Plan

If something goes wrong:

1. **Vercel**: Use "Redeploy" to previous deployment
2. **GitHub Pages**: Revert the commit that broke things
3. **Environment Variables**: Check all are set correctly

## Production Considerations

### Security
- ✅ API key authentication for automation endpoint
- ✅ File type validation (XML only)
- ✅ File size limits (10MB)
- ⚠️ Consider adding rate limiting
- ⚠️ Consider adding IP whitelist for automation API

### Performance
- ✅ Files stored in `public/` for CDN delivery
- ⚠️ Consider moving to S3/Cloud Storage for large scale
- ⚠️ Add file cleanup for old uploads

### Monitoring
- Monitor API endpoint usage
- Track file upload errors
- Set up alerts for failed uploads

## Troubleshooting

### API Routes Not Working
- **Issue**: 404 on API routes
- **Solution**: Ensure you're on a platform that supports Next.js API routes (Vercel, not GitHub Pages)

### File Upload Fails
- **Issue**: Permission denied
- **Solution**: Check write permissions on server filesystem

### Environment Variables Not Working
- **Issue**: API key authentication fails
- **Solution**: Verify environment variables are set in hosting platform

### Files Not Accessible
- **Issue**: 404 on uploaded files
- **Solution**: Ensure `public/uploads/xml/` directory exists and files are being saved there

