# Vercel Blob Storage Setup

## Overview

The upload API has been migrated to use **Vercel Blob Storage** for persistent file storage. This ensures files are not deleted when serverless functions restart or redeploy.

## Setup Instructions

### 1. Get Your Blob Storage Token

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `brainwave-landing` (or your project name)
3. Go to **Settings** → **Storage**
4. Click **Create Database** or **Create Storage** (if you haven't set up Blob Storage yet)
5. Select **Blob Storage**
6. Create a new Blob Storage instance
7. Copy the **Read/Write Token**

### 2. Set Environment Variable in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Paste the token you copied in step 1
   - **Environments**: ✅ Production ✅ Preview ✅ Development
3. Click **Save**

### 3. Redeploy

After adding the environment variable, Vercel will automatically redeploy. Alternatively, you can trigger a manual redeploy from the dashboard.

## How It Works

### Upload Flow
1. File is uploaded via `/api/upload/automation`
2. File is stored in Vercel Blob Storage at path: `uploads/xml/[filename].xml`
3. Returns a public blob URL that can be accessed directly

### Download Flow
1. Request comes to `/api/upload/download/[filename]`
2. File is fetched from Vercel Blob Storage
3. File content is returned with proper headers

### Benefits
- ✅ **Persistent storage** - Files survive redeployments and function restarts
- ✅ **Public access** - Files are publicly accessible via blob URLs
- ✅ **Automatic CDN** - Files are served via Vercel's CDN
- ✅ **Overwrite support** - Uploading the same filename overwrites the existing file

## Local Development

For local development, the API will fall back to filesystem storage in `public/uploads/xml/` if `BLOB_READ_WRITE_TOKEN` is not set. This allows you to test locally without setting up Blob Storage.

## File Access

### Via Blob URL (Production)
Files uploaded to Vercel Blob Storage are accessible via their blob URLs, which are returned in the upload response:
```json
{
  "success": true,
  "fileName": "blog.xml",
  "fullUrl": "https://[blob-url].public.blob.vercel-storage.com/uploads/xml/blog.xml",
  ...
}
```

### Via Download API (Backward Compatibility)
The download API endpoint still works:
```
GET /api/upload/download/blog.xml
```

## Troubleshooting

### Files Still Getting Deleted
- Verify `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- Check that the token has read/write permissions
- Ensure the deployment has completed after adding the token

### 401 Unauthorized Errors
- Verify the `BLOB_READ_WRITE_TOKEN` is correct
- Check that the token hasn't expired or been revoked
- Regenerate the token if needed

### Files Not Accessible
- Check that files are being uploaded with `access: 'public'`
- Verify the blob URL is correct
- Check Vercel Blob Storage dashboard to see if files exist

## Migration Notes

- Old files stored in `/tmp` on Vercel are not migrated automatically
- New uploads will use Blob Storage
- The download API will try to fetch from Blob Storage first, then fall back to filesystem (for local dev)

