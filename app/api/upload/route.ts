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

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return NextResponse.json(
        { error: 'Only XML files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Sanitize filename for security (preserve original name, just clean it)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Remove any path components for security
    const fileName = path.basename(sanitizedFileName);
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Check if file already exists (will be overwritten)
    const fileExists = existsSync(filePath);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Convert Buffer to Uint8Array for writeFile compatibility
    await writeFile(filePath, new Uint8Array(buffer));

    // Return success with file info
    // Always use the download API endpoint for consistency (works in both local and production)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    `http://localhost:3000`;
    
    return NextResponse.json({
      success: true,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      url: `/api/upload/download/${fileName}`,
      fullUrl: `${baseUrl}/api/upload/download/${fileName}`,
      uploadedAt: new Date().toISOString(),
      overwritten: fileExists
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { readdir, stat } = await import('fs/promises');
    
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const files = await readdir(UPLOAD_DIR);
    const fileList = await Promise.all(
      files
        .filter(file => file.toLowerCase().endsWith('.xml'))
        .map(async (file) => {
          const filePath = path.join(UPLOAD_DIR, file);
          const stats = await stat(filePath);
          return {
            fileName: file,
            originalName: file, // Filename is preserved, no timestamp prefix
            size: stats.size,
            url: `/api/upload/download/${file}`,
            uploadedAt: stats.birthtime.toISOString()
          };
        })
    );

    // Sort by upload date (newest first)
    fileList.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

