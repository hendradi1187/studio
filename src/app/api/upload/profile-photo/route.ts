import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/database';

const UPLOAD_DIR = path.join(process.cwd(), 'public/images/profiles');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Only JPG, PNG, and WebP are allowed', 
          code: 'INVALID_FILE_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large. Maximum size is 2MB', 
          code: 'FILE_TOO_LARGE' 
        },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExtension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const fileName = `user_${payload.userId}.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Ensure upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update user profile in database
    const relativePath = `/images/profiles/${fileName}`;
    const updateResult = await query(
      'UPDATE users SET profile_photo = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, profile_photo',
      [relativePath, payload.userId]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: relativePath,
      fileName: fileName,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}