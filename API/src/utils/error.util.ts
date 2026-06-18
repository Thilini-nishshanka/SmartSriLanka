import { Response } from 'express';
import { sendError } from './response.util';

/**
 * Custom error class for application-specific errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleAppError = (res: Response, error: any): void => {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
  } else {
    // Log the full error for debugging purposes
    console.error('UNHANDLED_ERROR:', error);
    sendError(res, 'An unexpected internal server error occurred.', 500);
  }
};
