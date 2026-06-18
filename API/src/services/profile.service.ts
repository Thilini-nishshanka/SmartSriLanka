import { ProfileRepository } from '../repositories/profile.repository';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
}

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfile(userId: string) {
    return this.profileRepository.findById(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    // Add validation or password hashing here if needed in the future
    return this.profileRepository.update(userId, data);
  }
}