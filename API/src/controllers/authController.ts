import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { RegisterDTO, LoginDTO, UpdateProfileDTO } from '../types/dto/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ✅ REGISTER
  register = async (req: Request, res: Response) => {
    try {
      const dto: RegisterDTO = req.body;
      const result = await this.authService.register(dto);
      return res.status(201).json(result); // service already returns { success, message, data }
    } catch (error: any) {
      console.error('Register error:', error);
      return sendError(res, error.message || 'Registration failed', error.statusCode || 400);
    }
  };

  // ✅ LOGIN
  login = async (req: Request, res: Response) => {
    try {
      const dto: LoginDTO = req.body;
      const result = await this.authService.login(dto);

      // Optional: Add redirectTo if your frontend expects it
      if (result?.data?.user?.role) {
        (result.data as any).redirectTo =
          result.data.user.role === 'admin' ? '/admin/dashboard' : '/';
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      return sendError(res, error.message || 'Login failed', error.statusCode || 401);
    }
  };

  // ✅ GET CURRENT USER
  getMe = async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return sendError(res, 'Authentication error: User not found.', 401);
      }

      const result = await this.authService.getCurrentUser(req.user.id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('GetMe error:', error);
      return sendError(res, error.message || 'Failed to fetch user', error.statusCode || 500);
    }
  };

  // ✅ UPDATE PROFILE
  updateProfile = async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return sendError(res, 'Authentication error: User not found.', 401);
      }

      const dto: UpdateProfileDTO = req.body;
      const updatedUser = await this.authService.updateProfile(req.user.id, dto);

      return sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      return sendError(res, error.message || 'Profile update failed', error.statusCode || 500);
    }
  };

  // ✅ LOGOUT
  logout = async (_req: Request, res: Response) => {
    try {
      // No token invalidation here — stateless JWT
      return sendSuccess(res, null, 'Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      return sendError(res, error.message || 'Logout failed', 500);
    }
  };

  // ✅ REFRESH TOKEN
  refreshToken = async (req: Request, res: Response) => {
    try {
      const token = req.body.refreshToken || req.body.refresh_token;
      if (!token) return sendError(res, 'Refresh token is required', 400);

      const result = await this.authService.refreshToken(token);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return sendError(res, 'Invalid or expired refresh token', 401);
    }
  };
}
