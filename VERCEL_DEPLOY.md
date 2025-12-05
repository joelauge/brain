# Vercel Deployment Guide

## Your Vercel Project
- **Platform**: Vercel ✅ (Perfect for Next.js API routes!)

## Pre-Deployment Checklist

### 1. Set Environment Variable in Vercel

**CRITICAL**: You must set `UPLOAD_API_KEY` before deploying!

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `UPLOAD_API_KEY`
   - **Value**: Generate a strong, random key (e.g., use: `openssl rand -hex 32`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

**Generate a secure API key:**
```bash
openssl rand -hex 32
```

### 2. Files Ready to Deploy

✅ **New API Routes:**
- `app/api/upload/route.ts` - Web upload endpoint
- `app/api/upload/automation/route.ts` - N8N automation endpoint

✅ **New Pages:**
- `app/fileuploads/page.tsx` - File upload UI

✅ **Documentation:**
- `docs/UPLOAD_API.md` - API documentation
- `DEPLOYMENT.md` - Deployment guide

✅ **Configuration:**
- `.gitignore` - Updated to exclude uploaded files
- `vercel.json` - Vercel configuration

### 3. Deploy Steps

**Option A: Automatic (Recommended)**
1. Commit and push to `main` branch
2. Vercel will automatically deploy
3. Check deployment status in Vercel dashboard

**Option B: Manual Deploy**
1. Use Vercel CLI: `vercel --prod`
2. Or trigger from Vercel dashboard

### 4. Post-Deployment Verification

After deployment, test:

1. **Upload Page**
   ```
   https://your-domain.com/fileuploads
   ```
   - Upload a test XML file
   - Verify it appears in the list
   - Check file is accessible at `/uploads/xml/[filename].xml`

2. **Automation API**
   ```bash
   curl -X POST https://your-domain.com/api/upload/automation \
     -H "X-API-Key: your-api-key" \
     -F "file=@test.xml"
   ```

3. **Health Check**
   ```bash
   curl https://your-domain.com/api/upload/automation
   ```

## Important Notes

### File Storage on Vercel
- Files are stored in `/public/uploads/xml/`
- **Note**: Vercel serverless functions have ephemeral filesystems
- Files may be lost on redeployment
- **For production**: Consider using Vercel Blob Storage or S3 for persistent storage

### Persistent Storage Options

If you need files to persist across deployments:

1. **Vercel Blob Storage** (Recommended)
   - Built-in to Vercel
   - Easy integration
   - Pay-as-you-go

2. **AWS S3 / Cloudflare R2**
   - More control
   - Lower costs at scale

3. **Database Storage**
   - Store file metadata in database
   - Files in cloud storage

### Current Implementation
The current implementation stores files in the filesystem, which works but:
- ✅ Works for testing and small-scale use
- ⚠️ Files may be lost on redeployment
- ⚠️ Not suitable for production at scale

## Troubleshooting

### API Key Not Working
- Verify `UPLOAD_API_KEY` is set in Vercel environment variables
- Check it's available in all environments (Production, Preview, Development)
- Redeploy after adding environment variable

### Files Not Persisting
- This is expected with serverless filesystems
- Consider migrating to Vercel Blob Storage or S3

### 404 on Upload Endpoint
- Check deployment logs in Vercel
- Verify API routes are included in build
- Check Next.js build output

## Next Steps

1. ✅ Set `UPLOAD_API_KEY` in Vercel
2. ✅ Commit and push changes
3. ✅ Wait for automatic deployment
4. ✅ Test upload functionality
5. ⚠️ Consider migrating to persistent storage for production

