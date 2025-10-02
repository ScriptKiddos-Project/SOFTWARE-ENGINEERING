import { ZodSchema } from 'zod';
import { ApiError } from './errors'; // Fix import path for ApiError

export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, 'Validation failed: ' + JSON.stringify(result.error.issues));
  }
  return result.data;
}
