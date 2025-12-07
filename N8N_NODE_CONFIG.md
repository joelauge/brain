# N8N Node Configuration - Copy & Paste

## Quick Setup Instructions

Since N8N doesn't support direct JSON paste for nodes, follow these steps:

### Step 1: Add HTTP Request Node
1. In N8N, drag an **HTTP Request** node into your workflow
2. Double-click to open the node configuration

### Step 2: Configure the Node

Copy and paste these values into the node:

**Method:**
```
POST
```

**URL:**
```
https://www.brainmediaconsulting.com/api/upload/automation
```

**Authentication:**
- Select: `None` (we'll add the API key in headers)

**Headers:**
Click "Add Header" and enter:
- **Name:** `X-API-Key`
- **Value:** `d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`

**Body:**
- **Body Content Type:** Select `Multipart-Form-Data`
- Click "Add Body Parameter"
  - **Name:** `file`
  - **Value:** `={{ $binary.data }}`

### Step 3: Save and Test

Click "Execute Node" to test. You should see a response like:

```json
{
  "success": true,
  "fileName": "test.xml",
  "url": "/api/upload/download/test.xml",
  ...
}
```

## Alternative: Import Full Workflow

If you want to import a complete workflow:

1. In N8N, go to **Workflows** → **Import from File**
2. Upload the file: `n8n-brain-upload-workflow.json`

## Node Configuration Summary

| Setting | Value |
|---------|-------|
| Method | POST |
| URL | `https://www.brainmediaconsulting.com/api/upload/automation` |
| Header | `X-API-Key: d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5` |
| Body Type | Multipart-Form-Data |
| Body Parameter | `file` = `={{ $binary.data }}` |

## Common Use Cases

### Upload from File Path
If you have a file path instead of binary data:
1. Add a **Read Binary File** node before the HTTP Request
2. Set the file path
3. Connect it to the Upload node

### Upload from JSON Data
If your XML is in JSON format:
1. Add a **Convert to Binary** node
2. Set input to `={{ $json.xmlContent }}`
3. Connect to Upload node

### Upload from Webhook
1. Add a **Webhook** node
2. Configure it to receive file uploads
3. Connect to Upload node (use `={{ $binary.data }}`)

## Troubleshooting

**Error: "Unauthorized"**
- Check that the API key header is set correctly
- Verify the API key matches: `d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`

**Error: "No file provided"**
- Ensure the body parameter name is exactly `file`
- Check that `={{ $binary.data }}` is correct (if using binary data)
- Verify the previous node outputs binary data

**File not uploading**
- Check file size is under 10MB
- Verify file has `.xml` extension
- Ensure body content type is `Multipart-Form-Data`


