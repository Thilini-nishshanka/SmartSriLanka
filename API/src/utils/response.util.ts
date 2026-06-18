import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string; // The main error message
  details?: any;  // Optional field for more detailed errors (like validation)
}

export const sendSuccess = <T>(res: Response, data: T, message = 'Success', statusCode = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 500, details?: any): void => {
  const response: ApiResponse<null> = {
    success: false,
    message: 'An error occurred',
    data: null,
    error,
    details,
  };
  res.status(statusCode).json(response);
};
