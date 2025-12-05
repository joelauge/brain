# API Key Setup for N8N Automation

## Step 1: Generate an API Key

**Generate a secure API key:**
```bash
openssl rand -hex 32
```

**Important**: Never commit your API key to version control!

## Step 2: Set in Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `UPLOAD_API_KEY`
   - **Value**: `YOUR_GENERATED_API_KEY` (paste the key you generated)
   - **Environments**: ✅ Production ✅ Preview ✅ Development
6. Click **Save**

## Step 3: Redeploy (if needed)

After adding the environment variable:
- Vercel will automatically redeploy, OR
- Go to **Deployments** tab and click **Redeploy** on the latest deployment

## Step 4: Use in N8N

### N8N HTTP Request Node Configuration

1. **Method**: `POST`
2. **URL**: `https://your-domain.com/api/upload/automation`
3. **Authentication**: 
   - **Type**: Header
   - **Name**: `X-API-Key`
   - **Value**: `YOUR_API_KEY` (use the key you set in Vercel)
4. **Body Content Type**: `Multipart-Form-Data`
5. **Body Parameters**:
   - **Name**: `file`
   - **Type**: File
   - **Value**: `{{ $binary.data }}` (from previous node)

### Alternative: Query Parameter

You can also pass the API key as a query parameter:
```
https://your-domain.com/api/upload/automation?apiKey=YOUR_API_KEY
```

### Alternative: Authorization Header

You can also use the Authorization header:
- **Name**: `Authorization`
- **Value**: `Bearer YOUR_API_KEY`

## Testing the API Key

Test with curl:
```bash
curl -X POST https://your-domain.com/api/upload/automation \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "file=@test.xml"
```

## Security Notes

- ✅ Keep your API key secret
- ✅ Never commit it to git
- ✅ Rotate it periodically if compromised
- ✅ Use different keys for different environments if needed

## Troubleshooting

### 401 Unauthorized
- Check that `UPLOAD_API_KEY` is set in Vercel
- Verify the API key in your request matches exactly
- Ensure you've redeployed after adding the environment variable

### Still not working?
- Check Vercel deployment logs
- Verify the environment variable is set for the correct environment (Production/Preview/Development)
- Make sure there are no extra spaces in the API key
