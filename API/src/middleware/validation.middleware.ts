import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/error.util';

export class ValidationMiddleware {
  static validate = (schemas: any[]) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        await Promise.all(schemas.map(schema => schema.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const validationError = new AppError('Validation failed', 400);
          validationError.details = errors.array();
          throw validationError;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };
}