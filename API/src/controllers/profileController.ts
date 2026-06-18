import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getMyProfile = async (req: Request, res: Response) => {
    try {
      const profile = await this.profileService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (error: any) {
      sendError(res, error.message);
    }
  };

  updateMyProfile = async (req: Request, res: Response) => {
    try {
      const updatedProfile = await this.profileService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, updatedProfile, 'Profile updated successfully.');
    } catch (error: any) {
      sendError(res, error.message);
    }
  };
}