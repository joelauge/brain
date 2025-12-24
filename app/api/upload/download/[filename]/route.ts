import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Use Vercel Blob Storage for persistent file storage
// Fallback to local filesystem for local development
const useBlobStorage = process.env.VERCEL === '1' || process.env.BLOB_READ_WRITE_TOKEN;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'xml');  // Local fallback

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security: Only allow XML files and prevent directory traversal
    if (!filename.toLowerCase().endsWith('.xml') || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    let fileContent: Buffer;

    if (useBlobStorage) {
      // Fetch from Vercel Blob Storage
      const blobPath = `uploads/xml/${filename}`;
      
      try {
        // Check if blob exists
        const blob = await head(blobPath);
        
        if (!blob) {
          return NextResponse.json(
            { error: 'File not found' },
            { status: 404 }
          );
        }

        // Fetch the blob content (blob URL is publicly accessible)
        const response = await fetch(blob.url);
        if (!response.ok) {
          return NextResponse.json(
            { error: 'File not found' },
            { status: 404 }
          );
        }
        
        const arrayBuffer = await response.arrayBuffer();
        fileContent = Buffer.from(arrayBuffer);
      } catch (error) {
        // If head fails, the blob doesn't exist
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    } else {
      // Local development: use filesystem
      const filePath = path.join(UPLOAD_DIR, filename);

      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      fileContent = await readFile(filePath);
    }
    
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
