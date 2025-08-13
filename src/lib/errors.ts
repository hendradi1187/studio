import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors: string[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// Error response formatter
export function errorResponse(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.errors,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Database constraint errors
  if (error instanceof Error && error.message.includes('duplicate key')) {
    return NextResponse.json(
      {
        error: 'Resource already exists',
        code: 'DUPLICATE_ERROR',
      },
      { status: 409 }
    );
  }

  // Foreign key constraint errors
  if (error instanceof Error && error.message.includes('foreign key constraint')) {
    return NextResponse.json(
      {
        error: 'Referenced resource does not exist',
        code: 'FOREIGN_KEY_ERROR',
      },
      { status: 400 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// Success response formatter
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Created response formatter
export function createdResponse(data: any): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

// No content response
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// Async handler wrapper for consistent error handling
export function asyncHandler(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}