import { z } from 'zod';

// Fix ValidationError import issue
export class ValidationError extends Error {
  constructor(message: string, public errors: string[] = []) {
    super(message);
    this.name = 'ValidationError';
  }
}

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationId: z.string().min(1, 'Organization is required'),
  roleId: z.string().min(1, 'Role is required'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  organizationId: z.string().min(1, 'Organization is required').optional(),
  roleId: z.string().min(1, 'Role is required').optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Asset validation schemas
export const createAssetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  accessStatus: z.enum(['open', 'restricted', 'by_request', 'private']).default('private'),
  dataFormat: z.string().optional(),
  dataStructure: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  geographicArea: z.string().optional(),
  timePeriodStart: z.string().datetime().optional(),
  timePeriodEnd: z.string().datetime().optional(),
  version: z.string().default('1.0'),
  fileSize: z.number().optional(),
  filePath: z.string().optional(),
  category: z.enum(['seismic', 'well_logs', 'production', 'reports', 'other']).default('other'),
  vocabularyIds: z.array(z.string()).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

// Policy validation schemas
export const createPolicySchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters'),
  description: z.string().optional(),
  policyType: z.enum(['access', 'contract', 'usage']),
  policyRules: z.record(z.any()).optional(),
  permissionsCount: z.number().int().min(0).default(0),
  prohibitionsCount: z.number().int().min(0).default(0),
  obligationsCount: z.number().int().min(0).default(0),
});

export const updatePolicySchema = createPolicySchema.partial();

// Data offer validation schemas
export const createDataOfferSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  accessPolicyId: z.string().optional(),
  contractPolicyId: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  validUntil: z.string().datetime().optional(),
});

export const updateDataOfferSchema = createDataOfferSchema.partial();

// Vocabulary validation schemas
export const createVocabularySchema = z.object({
  term: z.string().min(1, 'Term is required'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  level: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
});

// Broker connection validation schemas
export const createBrokerConnectionSchema = z.object({
  name: z.string().min(3, 'Connection name must be at least 3 characters'),
  organizationId: z.string().optional(),
  connectionType: z.enum(['api', 'ftp', 'sftp', 'database', 'web_service']),
  endpointUrl: z.string().url('Invalid URL format').optional(),
  syncFrequency: z.string().default('daily'),
});

export const updateBrokerConnectionSchema = createBrokerConnectionSchema.partial();

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '10') || 10, 100)), // Max 100 items per page
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Access request validation schemas
export const createAccessRequestSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  requestReason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  intendedUse: z.string().min(10, 'Please describe the intended use (minimum 10 characters)'),
});

// Contract validation schemas
export const createContractSchema = z.object({
  dataOfferId: z.string().min(1, 'Data offer ID is required'),
  consumerId: z.string().min(1, 'Consumer organization ID is required'),
  contractTerms: z.record(z.any()).optional(),
});

// Validation helper function
export function validateBody<T>(schema: z.ZodSchema<T>, body: any): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Query parameter validation helper with any type for flexibility
export function validateQuery(schema: any, query: URLSearchParams): { success: true; data: any } | { success: false; errors: string[] } {
  try {
    const queryObject = Object.fromEntries(query);
    const data = schema.parse(queryObject);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Query validation failed'] };
  }
}