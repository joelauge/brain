# N8N Upload Node Configuration

## Quick Setup Guide

### Option 1: Manual Node Configuration (Recommended)

1. **Add HTTP Request Node**
   - Drag an "HTTP Request" node into your workflow
   - Name it: "Upload XML to Brain Consulting"

2. **Configure the Node:**

   **Method:** `POST`
   
   **URL:** `https://www.brainmediaconsulting.com/api/upload/automation`
   
   **Authentication:** 
   - Select "Header Auth" or "Generic Credential Type"
   - Name: `X-API-Key`
   - Value: `d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`
   
   **Body:**
   - Body Content Type: `Multipart-Form-Data`
   - Add parameter:
     - Name: `file`
     - Value: `={{ $binary.data }}` (if using binary data from previous node)
     - OR: `={{ $json.file }}` (if file is in JSON data)
   - **IMPORTANT - Preserve Filename:** Add a second parameter:
     - Name: `filename`
     - Value: `={{ $binary.fileName }}` or `={{ $json.fileName }}` or the actual filename like `newsfeed.xml`
     - This ensures files keep their original names (newsfeed.xml, blog.xml, sitemap.xml) instead of being renamed to uploaded.xml

3. **Test the Node:**
   - Connect a node that outputs a file (e.g., Read Binary File, or a node that creates XML)
   - Execute the workflow
   - Check the response for `success: true`

### Option 2: Paste JSON Configuration

Copy the JSON from `n8n-upload-node-complete.json` and paste it into N8N's import workflow feature.

## Example Workflow

### Scenario: Upload XML file from a trigger

```
[Webhook/Trigger] → [Read Binary File] → [Upload XML File] → [Response]
```

**Node Configuration:**

1. **Read Binary File Node:**
   - File Path: Path to your XML file
   - Output: Binary data

2. **Upload XML File Node (HTTP Request):**
   - Method: POST
   - URL: `https://www.brainmediaconsulting.com/api/upload/automation`
   - Headers:
     - `X-API-Key`: `d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`
   - Body: Multipart-Form-Data
     - `file`: `={{ $binary.data }}`
     - `filename`: `={{ $binary.fileName }}` (to preserve original filename)

### Scenario: Upload XML from JSON data

If your XML is in JSON format:

```
[Trigger] → [Upload XML File]
```

**Body Parameter:**
- Name: `file`
- Value: `={{ $json.xmlContent }}` (if XML is a string)
- OR use a "Convert to Binary" node first

## Response Format

On success, you'll receive:

```json
{
  "success": true,
  "fileName": "test.xml",
  "originalName": "test.xml",
  "size": 189,
  "url": "/api/upload/download/test.xml",
  "fullUrl": "http://www.brainmediaconsulting.com/api/upload/download/test.xml",
  "uploadedAt": "2025-12-07T03:00:27.116Z",
  "overwritten": false
}
```

## Error Handling

If authentication fails:
```json
{
  "success": false,
  "error": "Unauthorized. Invalid or missing API key.",
  "hint": "Include API key in X-API-Key header, Authorization header, or apiKey query parameter"
}
```

## Alternative Authentication Methods

The API also supports:

1. **Authorization Header:**
   - Header: `Authorization`
   - Value: `Bearer d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`

2. **Query Parameter:**
   - URL: `https://www.brainmediaconsulting.com/api/upload/automation?apiKey=d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5`

## File Formats Supported

- ✅ Multipart-Form-Data (recommended)
- ✅ Application/XML (raw binary)
- ✅ Application/JSON (with base64 encoded file)

## File Requirements

- ✅ Only XML files (`.xml` extension)
- ✅ Maximum size: 10MB
- ✅ Original filename is preserved

## Testing

Test your N8N workflow with:

```bash
curl -X POST https://www.brainmediaconsulting.com/api/upload/automation \
  -H "X-API-Key: d3ec3b034d1151aea7fb3a43241cb0311c458e1f0309e93e6dd5b0e888465cb5" \
  -F "file=@test.xml"
```

## Troubleshooting

**Issue: 401 Unauthorized**
- Check that the API key is correctly set in the header
- Verify the API key matches the one in Vercel environment variables

**Issue: File not uploading**
- Ensure the file is binary data or properly formatted
- Check file size is under 10MB
- Verify file has `.xml` extension

**Issue: Files being renamed to "uploaded.xml"**
- **Solution:** Add a `filename` parameter in the multipart form data
- Set the `filename` parameter to the actual filename (e.g., `newsfeed.xml`, `blog.xml`, `sitemap.xml`)
- The API will use this filename instead of defaulting to `uploaded.xml`
- Example: In N8N, add a second body parameter:
  - Name: `filename`
  - Value: `={{ $binary.fileName }}` or hardcode it like `newsfeed.xml`


