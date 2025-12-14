import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Use Vercel Blob Storage for persistent file storage
// Fallback to local filesystem for local development
const useBlobStorage = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'xml');  // Local fallback
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Extract filename from Content-Disposition header or use default
 */
function extractFilename(contentDisposition: string | null, defaultName: string = 'uploaded.xml'): string {
  if (!contentDisposition) return defaultName;
  
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '');
  }
  
  return defaultName;
}

export async function POST(request: NextRequest) {
  try {
    // No authentication required - public upload endpoint
    // Ensure upload directory exists for local development
    if (!useBlobStorage && !existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let fileName = 'uploaded.xml';
    let requestedFileName: string | null = null;

    // Check for filename parameter in query params (works for all request types)
    const url = new URL(request.url);
    requestedFileName = url.searchParams.get('filename');

    // Handle multipart/form-data (standard file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file') as File;
      
      // Also check for 'data' field (common in automation tools)
      if (!file) {
        file = formData.get('data') as File;
      }
      
      // Check for filename in form data if not in query params
      if (!requestedFileName) {
        requestedFileName = formData.get('filename') as string | null;
      }
      
      if (file) {
        fileName = file.name;
      }
    } 
    // Handle raw file data (binary/octet-stream)
    else if (contentType.includes('application/octet-stream') || 
             contentType.includes('application/xml') || 
             contentType.includes('text/xml')) {
      const arrayBuffer = await request.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = request.headers.get('content-disposition');
      fileName = extractFilename(contentDisposition);
      
      // Create a File-like object for validation (convert Buffer to Uint8Array)
      file = new File([new Uint8Array(buffer)], fileName, { type: contentType });
    }
    // Handle JSON with base64 encoded file
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      
      // Check for filename in JSON body if not in query params
      if (!requestedFileName && body.filename) {
        requestedFileName = body.filename;
      }
      
      if (body.file || body.data) {
        const fileData = body.file || body.data;
        const fileContent = fileData.content || fileData.base64 || fileData.data;
        const fileType = fileData.filename || fileData.name || 'uploaded.xml';
        
        if (typeof fileContent === 'string') {
          // Handle base64 encoded content
          const base64Data = fileContent.replace(/^data:.*,/, ''); // Remove data URL prefix if present
          const buffer = Buffer.from(base64Data, 'base64');
          fileName = fileType.endsWith('.xml') ? fileType : `${fileType}.xml`;
          // Convert Buffer to Uint8Array for File constructor
          file = new File([new Uint8Array(buffer)], fileName, { type: 'application/xml' });
        } else {
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid file format in JSON body. Expected base64 encoded content.'
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: 'No file data provided. Include "file" or "data" field in JSON body.'
          },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided',
          hint: 'Send file as multipart/form-data, raw binary, or JSON with base64 encoded content'
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!fileName.toLowerCase().endsWith('.xml')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Only XML files are allowed',
          received: fileName
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false,
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
          size: file.size,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Determine final filename - use requested filename or original filename
    // If same filename is uploaded, it will overwrite the existing file
    let finalFileName: string;
    if (requestedFileName) {
      // Sanitize the requested filename
      const sanitized = requestedFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      // Ensure it ends with .xml
      finalFileName = sanitized.endsWith('.xml') ? sanitized : `${sanitized}.xml`;
    } else {
      // Use original filename (sanitized) - will overwrite if same name exists
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      finalFileName = sanitizedFileName.endsWith('.xml') ? sanitizedFileName : `${sanitizedFileName}.xml`;
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let blobUrl: string;
    let fileExists = false;

    if (useBlobStorage) {
      // Use Vercel Blob Storage for persistent storage
      const blobPath = `uploads/xml/${finalFileName}`;
      
      // Check if blob exists (Vercel Blob doesn't have a direct exists check, so we'll try to upload)
      // If the same path is used, it will overwrite automatically
      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: 'application/xml',
      });
      
      blobUrl = blob.url;
    } else {
      // Local development: use filesystem
      const filePath = path.join(UPLOAD_DIR, finalFileName);
      fileExists = existsSync(filePath);
      await writeFile(filePath, new Uint8Array(buffer));
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      request.headers.get('origin') || 
                      `http://${request.headers.get('host') || 'localhost:3000'}`;
      blobUrl = `${baseUrl}/uploads/xml/${finalFileName}`;
    }

    // Return success with file info
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    request.headers.get('origin') || 
                    `http://${request.headers.get('host') || 'localhost:3000'}`;
    
    return NextResponse.json({
      success: true,
      fileName: finalFileName,
      originalName: fileName,
      size: file.size,
      url: useBlobStorage ? blobUrl : `/uploads/xml/${finalFileName}`,
      fullUrl: blobUrl,
      uploadedAt: new Date().toISOString(),
      overwritten: fileExists,
      storage: useBlobStorage ? 'vercel-blob' : 'filesystem'
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file via automation API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'File Upload Automation API',
    version: '2.0.0',
    status: 'operational',
    endpoints: {
      upload: 'POST /api/upload/automation',
      download: 'GET /api/upload/download/[filename]',
      authentication: 'No authentication required - public endpoint'
    },
    parameters: {
      filename: 'Optional. Specify custom filename via query parameter (?filename=myfile.xml) or in request body/form data. If not provided, uses original filename. Uploading the same filename will overwrite the existing file.'
    },
    behavior: {
      overwrite: 'Files with the same filename will be overwritten',
      publicAccess: 'All uploaded files are publicly accessible',
      storage: useBlobStorage ? 'Vercel Blob Storage (persistent)' : 'Local filesystem (/uploads/xml/)'
    },
    supportedFormats: [
      'multipart/form-data',
      'application/octet-stream',
      'application/xml',
      'text/xml',
      'application/json (with base64 encoded file)'
    ],
    maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    storageLocation: '/uploads/xml/'
  });
}

