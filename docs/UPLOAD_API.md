# File Upload Automation API

This API endpoint allows automated file uploads (e.g., from N8N workflows) to the same storage location as the web interface.

## Endpoint

```
POST /api/upload/automation
GET /api/upload/automation (health check)
```

## Authentication

All requests require an API key. Set the API key in your `.env.local` file:

```bash
UPLOAD_API_KEY=your-secret-api-key-here
```

The API key can be provided in three ways:
1. **Header**: `X-API-Key: your-secret-api-key-here`
2. **Authorization Header**: `Authorization: Bearer your-secret-api-key-here`
3. **Query Parameter**: `?apiKey=your-secret-api-key-here`

## Supported Formats

The API accepts files in multiple formats:

1. **Multipart Form Data** (recommended for N8N)
2. **Raw Binary** (application/octet-stream, application/xml, text/xml)
3. **JSON with Base64** (for JSON-based workflows)

## Request Examples

### 1. Multipart Form Data (Recommended for N8N)

**N8N HTTP Request Node Configuration:**
- **Method**: POST
- **URL**: `https://brainmediaconsulting.com/api/upload/automation`
- **Authentication**: Header
  - **Name**: `X-API-Key`
  - **Value**: `your-secret-api-key-here`
- **Body Content Type**: Multipart-Form-Data
- **Body Parameters**:
  - **Name**: `file`
  - **Type**: File
  - **Value**: `{{ $binary.data }}` (or your file data)

**cURL Example:**
```bash
curl -X POST https://brainmediaconsulting.com/api/upload/automation \
  -H "X-API-Key: your-secret-api-key-here" \
  -F "file=@data.xml"
```

### 2. Raw Binary Upload

**N8N HTTP Request Node Configuration:**
- **Method**: POST
- **URL**: `https://brainmediaconsulting.com/api/upload/automation`
- **Authentication**: Header
  - **Name**: `X-API-Key`
  - **Value**: `your-secret-api-key-here`
- **Body Content Type**: Raw
- **Body Content Type**: Binary Data
- **Body**: `{{ $binary.data }}`
- **Headers**:
  - **Content-Type**: `application/xml`
  - **Content-Disposition**: `attachment; filename="data.xml"`

**cURL Example:**
```bash
curl -X POST https://brainmediaconsulting.com/api/upload/automation \
  -H "X-API-Key: your-secret-api-key-here" \
  -H "Content-Type: application/xml" \
  -H "Content-Disposition: attachment; filename=\"data.xml\"" \
  --data-binary "@data.xml"
```

### 3. JSON with Base64 Encoded File

**N8N HTTP Request Node Configuration:**
- **Method**: POST
- **URL**: `https://brainmediaconsulting.com/api/upload/automation`
- **Authentication**: Header
  - **Name**: `X-API-Key`
  - **Value**: `your-secret-api-key-here`
- **Body Content Type**: JSON
- **Body**:
```json
{
  "file": {
    "filename": "data.xml",
    "content": "{{ $binary.dataBase64 }}"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://brainmediaconsulting.com/api/upload/automation \
  -H "X-API-Key: your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "file": {
      "filename": "data.xml",
      "content": "base64-encoded-content-here"
    }
  }'
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "fileName": "1704067200000_data.xml",
  "originalName": "data.xml",
  "size": 1024,
  "url": "/uploads/xml/1704067200000_data.xml",
  "fullUrl": "https://brainmediaconsulting.com/uploads/xml/1704067200000_data.xml",
  "uploadedAt": "2024-01-01T12:00:00.000Z"
}
```

### Error Response (400/401/500)

```json
{
  "success": false,
  "error": "Error message",
  "hint": "Additional help text"
}
```

## N8N Workflow Setup

### Step-by-Step Guide

1. **Add HTTP Request Node**
   - Drag and drop an HTTP Request node into your workflow

2. **Configure the Request**
   - **Method**: POST
   - **URL**: `https://brainmediaconsulting.com/api/upload/automation`
   - **Authentication**: Generic Credential Type
     - **Name**: `X-API-Key`
     - **Value**: Your API key from `.env.local`

3. **Set Headers**
   - Add header: `X-API-Key` = `{{ $env.UPLOAD_API_KEY }}` (or hardcode your key)

4. **Configure Body**
   - **Body Content Type**: Multipart-Form-Data
   - **Body Parameters**:
     - **Name**: `file`
     - **Type**: File
     - **Value**: `{{ $binary.data }}` (from previous node that reads the file)

5. **Handle Response**
   - The response will contain the file URL which you can use in subsequent nodes

### Example N8N Workflow

```
[Read Binary File] → [HTTP Request (Upload)] → [Send Notification]
```

**Read Binary File Node:**
- File Path: `/path/to/your/file.xml`

**HTTP Request Node:**
- Method: POST
- URL: `https://brainmediaconsulting.com/api/upload/automation`
- Headers: `X-API-Key: your-key`
- Body: Multipart-Form-Data
  - `file`: `{{ $binary.data }}`

**Response:**
- Access uploaded file URL: `{{ $json.fullUrl }}`

## File Storage

Uploaded files are stored in:
```
public/uploads/xml/
```

They are publicly accessible at:
```
https://brainmediaconsulting.com/uploads/xml/[filename].xml
```

## Validation

- **File Type**: Only `.xml` files are accepted
- **File Size**: Maximum 10MB per file
- **Filename**: Automatically sanitized and prefixed with timestamp to prevent conflicts

## Health Check

Check API status:
```bash
GET /api/upload/automation
```

Response:
```json
{
  "service": "File Upload Automation API",
  "version": "1.0.0",
  "status": "operational",
  "endpoints": {
    "upload": "POST /api/upload/automation",
    "authentication": "API key required"
  },
  "supportedFormats": [...],
  "maxFileSize": "10MB",
  "storageLocation": "/uploads/xml/"
}
```

## Security Notes

1. **API Key**: Keep your API key secure. Never commit it to version control.
2. **Rate Limiting**: Consider implementing rate limiting for production use.
3. **File Validation**: Files are validated for type and size before storage.
4. **Public Access**: Uploaded files are publicly accessible. Don't upload sensitive data.

## Troubleshooting

### 401 Unauthorized
- Check that `UPLOAD_API_KEY` is set in your `.env.local`
- Verify the API key in your request matches the environment variable
- Ensure the API key is sent in the correct header or query parameter

### 400 Bad Request
- Verify the file is an XML file (`.xml` extension)
- Check file size is under 10MB
- Ensure file data is properly formatted in the request body

### 500 Internal Server Error
- Check server logs for detailed error messages
- Verify the upload directory has write permissions
- Ensure sufficient disk space is available

