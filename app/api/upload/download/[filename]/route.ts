import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';

// Use the same conditional logic as upload endpoints
// On Vercel, use /tmp for writable storage, otherwise use public/uploads/xml
const isVercel = process.env.VERCEL === '1';
const UPLOAD_DIR = isVercel 
  ? path.join('/tmp', 'uploads', 'xml')
  : path.join(process.cwd(), 'public', 'uploads', 'xml');

/**
 * Verify API key from request headers or query params
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '') ||
                 new URL(request.url).searchParams.get('apiKey');
  
  const expectedApiKey = process.env.UPLOAD_API_KEY;
  
  if (!expectedApiKey) {
    return false;
  }
  
  return apiKey === expectedApiKey;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Check authentication: Allow access if API key is valid, otherwise require Clerk auth
    const hasValidApiKey = verifyApiKey(request);
    const { userId } = await auth();
    
    if (!hasValidApiKey && !userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide API key or authenticate.' },
        { status: 401 }
      );
    }
    
    // Security: Only allow XML files and prevent directory traversal
    if (!filename.toLowerCase().endsWith('.xml') || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileContent = await readFile(filePath);
    
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(fileContent), {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

