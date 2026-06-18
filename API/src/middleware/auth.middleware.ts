// import { Request, Response, NextFunction } from 'express';
// import { verifyAccessToken } from '../utils/jwt';
// import { AppError } from '../utils/error.util';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         role: string;
//       };
//     }
//   }
// }

// export class AuthMiddleware {
//   static authenticate = async (req: Request, _res: Response, next: NextFunction) => {
//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         throw new AppError('No token provided', 401);
//       }

//       const token = authHeader.split(' ')[1];
//       if (!token) {
//         throw new AppError('Invalid token', 401);
//       }
//       const decoded = verifyAccessToken(token);

//       req.user = {
//         id: decoded.userId,
//         email: decoded.email,
//         role: decoded.role
//       };

//       next();
//     } catch (error) {
//       next(new AppError('Not authenticated', 401));
//     }
//   };

//   static authorize = (...roles: string[]) => {
//     return (req: Request, _res: Response, next: NextFunction) => {
//       if (!req.user) {
//         return next(new AppError('Not authenticated', 401));
//       }

//       if (!roles.includes(req.user.role)) {
//         return next(new AppError('Not authorized', 403));
//       }

//       next();
//     };
//   };
// }


import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/error.util';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  static authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new AppError('Invalid token', 401);
      }
      
      const decoded = verifyAccessToken(token);

      // Make sure the field names match what's in your JWT payload
      req.user = {
        id: decoded.userId, // This should match the field in your JWT
        email: decoded.email,
        role: decoded.role
      };

      console.log('Authenticated user:', req.user);
      next();
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Pass specific error message for better debugging
      if (error.message === 'Invalid access token' || error.name === 'TokenExpiredError') {
        next(new AppError('Token expired or invalid', 401));
      } else {
        next(new AppError('Not authenticated', 401));
      }
    }
  };

  static authorize = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      if (!roles.includes(req.user.role)) {
        return next(new AppError('Not authorized', 403));
      }

      next();
    };
  };
}