# 🚀 Quick Deploy Guide - Vercel

## Your Setup
- **Vercel Project**: `prj_xUlapPT1tbkM2xmjNvyYvpJVpuHd`
- **Status**: Ready to deploy! ✅

## ⚠️ CRITICAL: Set Environment Variable First!

**Before deploying, you MUST set the API key in Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add:
   - **Key**: `UPLOAD_API_KEY`
   - **Value**: Generate one with: `openssl rand -hex 32`
   - **Environments**: ✅ Production ✅ Preview ✅ Development
5. **Save**

## 📦 Files Ready to Deploy

All new files are ready:
- ✅ `app/api/upload/route.ts` - Web upload API
- ✅ `app/api/upload/automation/route.ts` - N8N automation API  
- ✅ `app/fileuploads/page.tsx` - Upload page
- ✅ `docs/UPLOAD_API.md` - Documentation
- ✅ `.gitignore` - Updated
- ✅ `vercel.json` - Vercel config

## 🎯 Deploy Steps

### 1. Review Changes
```bash
git status
```

### 2. Stage Files (Exclude backups)
```bash
# Add new files
git add app/api/upload/
git add app/fileuploads/
git add docs/UPLOAD_API.md
git add DEPLOYMENT.md
git add DEPLOY_CHECKLIST.md
git add VERCEL_DEPLOY.md
git add vercel.json
git add .github/
git add .gitignore

# Add modified files (if you want to include them)
# git add app/booking/page.tsx
# git add lib/email.ts
# etc.
```

### 3. Commit
```bash
git commit -m "Add file upload feature with web UI and N8N automation API"
```

### 4. Push (Auto-deploys to Vercel)
```bash
git push origin main
```

### 5. Monitor Deployment
- Check Vercel dashboard for deployment status
- Watch build logs
- Verify deployment succeeds

## ✅ Post-Deployment Test

1. **Test Upload Page**
   ```
   https://your-domain.com/fileuploads
   ```

2. **Test Automation API**
   ```bash
   curl -X POST https://your-domain.com/api/upload/automation \
     -H "X-API-Key: YOUR_API_KEY" \
     -F "file=@test.xml"
   ```

## ⚠️ Important Notes

### File Storage Limitation
Files are stored in the filesystem, which on Vercel:
- ✅ Works for testing
- ⚠️ Files may be lost on redeployment (serverless filesystem)
- 💡 For production, consider Vercel Blob Storage or S3

### Safe Deployment
- ✅ New routes won't break existing site
- ✅ Upload page is separate route
- ✅ API endpoints are new
- ✅ No changes to existing pages (unless you staged them)

## 🆘 If Something Goes Wrong

1. **Check Vercel Logs**: Dashboard → Deployments → View Logs
2. **Revert**: `git revert HEAD` and push
3. **Redeploy Previous**: Vercel dashboard → Redeploy previous version

## 🎉 You're Ready!

Just set the `UPLOAD_API_KEY` environment variable in Vercel, then commit and push!

