import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'xml');
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

    // Generate unique filename (timestamp + original name)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return success with file info
    return NextResponse.json({
      success: true,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      url: `/uploads/xml/${fileName}`,
      uploadedAt: new Date().toISOString()
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
            originalName: file.replace(/^\d+_/, ''), // Remove timestamp prefix
            size: stats.size,
            url: `/uploads/xml/${file}`,
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

