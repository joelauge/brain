import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// On Vercel, use /tmp for writable storage, otherwise use public/uploads/xml
// Note: Files in /tmp won't be publicly accessible, but will work for API
// For production, consider using Vercel Blob Storage or S3
const isVercel = process.env.VERCEL === '1';
const UPLOAD_DIR = isVercel 
  ? path.join('/tmp', 'uploads', 'xml')
  : path.join(process.cwd(), 'public', 'uploads', 'xml');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Verify API key from request headers or query params
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '') ||
                 new URL(request.url).searchParams.get('apiKey');
  
  const expectedApiKey = process.env.UPLOAD_API_KEY;
  
  if (!expectedApiKey) {
    console.warn('UPLOAD_API_KEY not set in environment variables');
    return false;
  }
  
  return apiKey === expectedApiKey;
}

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
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Invalid or missing API key.',
          hint: 'Include API key in X-API-Key header, Authorization header, or apiKey query parameter'
        },
        { status: 401 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;
    let fileName = 'uploaded.xml';

    // Handle multipart/form-data (standard file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file') as File;
      
      // Also check for 'data' field (common in automation tools)
      if (!file) {
        file = formData.get('data') as File;
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

    // Generate unique filename (timestamp + original name)
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(UPLOAD_DIR, finalFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Convert Buffer to Uint8Array for writeFile compatibility
    await writeFile(filePath, new Uint8Array(buffer));

    // Return success with file info
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    request.headers.get('origin') || 
                    `http://${request.headers.get('host') || 'localhost:3000'}`;
    
    return NextResponse.json({
      success: true,
      fileName: finalFileName,
      originalName: fileName,
      size: file.size,
      url: isVercel ? `/api/upload/download/${finalFileName}` : `/uploads/xml/${finalFileName}`,
      fullUrl: isVercel ? `${baseUrl}/api/upload/download/${finalFileName}` : `${baseUrl}/uploads/xml/${finalFileName}`,
      uploadedAt: new Date().toISOString()
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
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      upload: 'POST /api/upload/automation',
      authentication: 'API key required (X-API-Key header, Authorization header, or apiKey query param)'
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

