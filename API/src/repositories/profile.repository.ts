import { Prisma, Profile } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class ProfileRepository extends BaseRepository<Profile> {
  async findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }
}