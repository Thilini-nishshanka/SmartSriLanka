import { Profile, UserRole } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class ProfileRepository extends BaseRepository<Profile> {
  async findById(id: string): Promise<Omit<Profile, 'password'> | null> {
    return this.prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    console.log('Finding user by email:', email);
    const user = await this.prisma.profile.findUnique({
      where: { email: email.toLowerCase() }, // Ensure case-insensitive comparison
    });
    console.log('Database result:', user ? { ...user, password: '[REDACTED]' } : 'null');
    return user;
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
  }): Promise<Omit<Profile, 'password'>> {
    return this.prisma.profile.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      country?: string;
      avatarUrl?: string;
    }
  ): Promise<Omit<Profile, 'password'>> {
    return this.prisma.profile.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        country: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.profile.count();
  }
}