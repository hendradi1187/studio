import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const uploadSchema = z.object({
  assetId: z.string().optional(),
  category: z.enum(['seismic', 'well_logs', 'production', 'reports', 'other']).default('other')
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'other';
    const assetId = formData.get('assetId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 100 * 1024 * 1024 * 1024; // 100GB for large seismic files
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100GB' },
        { status: 400 }
      );
    }

    // Allowed file types for oil & gas data
    const allowedTypes = [
      // Seismic formats
      'application/octet-stream', // .sgy, .segy
      'application/x-binary',
      // Well log formats
      'text/plain', // .las
      'application/x-las',
      // General formats
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf',
      'application/json',
      'text/xml',
      'application/xml',
      // Image formats
      'image/png',
      'image/jpeg',
      'image/tiff',
      // Archive formats
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];

    // For binary files (like .sgy), check by extension
    const fileName = file.name.toLowerCase();
    const isSeismicFile = fileName.endsWith('.sgy') || fileName.endsWith('.segy') || 
                         fileName.endsWith('.seg') || fileName.endsWith('.segx');
    const isWellLogFile = fileName.endsWith('.las') || fileName.endsWith('.dlis') || 
                         fileName.endsWith('.lis');
    
    if (!allowedTypes.includes(file.type) && !isSeismicFile && !isWellLogFile) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: SEG-Y, LAS, CSV, Excel, PDF, Images, Archives' },
        { status: 400 }
      );
    }

    // Create directory structure
    const uploadsDir = join(process.cwd(), 'uploads', 'assets', category);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Calculate relative path for database storage
    const relativePath = `/uploads/assets/${category}/${uniqueFileName}`;

    console.log('File uploaded successfully:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      category,
      path: relativePath
    });

    return NextResponse.json({
      success: true,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      category,
      path: relativePath,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded files for an asset
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const category = searchParams.get('category');

    // In a real implementation, you would query the database
    // for files associated with the asset
    return NextResponse.json({
      files: [], // Placeholder - implement database query
      message: 'File listing not yet implemented'
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}