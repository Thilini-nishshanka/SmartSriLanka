// import { ProfileRepository } from '../repositories/profileRepository';
// import { PasswordUtil } from '../utils/password.util';
// import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt';
// import { RegisterDTO, LoginDTO, UpdateProfileDTO, UserDTO } from '../types/dto/auth.dto';
// import { AppError } from '../utils/error.util';
// import type { Profile } from '@prisma/client';

// export class AuthService {
//   private profileRepository: ProfileRepository;

//   constructor() {
//     this.profileRepository = new ProfileRepository();
//   }

//   async register(dto: RegisterDTO): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
//     const normalizedEmail = dto.email.toLowerCase();

//     const existingUser = await this.profileRepository.findByEmail(normalizedEmail);
//     if (existingUser) {
//       throw new AppError('Email already registered', 409);
//     }

//     const hashedPassword = await PasswordUtil.hash(dto.password);

//     const user = await this.profileRepository.create({
//       email: normalizedEmail,
//       name: dto.name,
//       password: hashedPassword,
//       role: 'user',
//     });

//     const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
//     const accessToken = generateAccessToken(payload);
//     const refreshToken = generateRefreshToken(payload);

//     return { user: this.mapUserToDTO(user), accessToken, refreshToken };
//   }

//   async login(dto: LoginDTO): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
//     const normalizedEmail = dto.email.toLowerCase();
//     const user = await this.profileRepository.findByEmail(normalizedEmail);

//     if (!user || !user.password) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
//     if (!isPasswordValid) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
//     const accessToken = generateAccessToken(payload);
//     const refreshToken = generateRefreshToken(payload);

//     return { user: this.mapUserToDTO(user), accessToken, refreshToken };
//   }

//   async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
//     const payload = verifyRefreshToken(token);
//     const newPayload = {
//       userId: payload.userId,
//       email: payload.email,
//       role: payload.role,
//     };
//     const newAccessToken = generateAccessToken(newPayload as JwtPayload);
//     const newRefreshToken = generateRefreshToken(newPayload);
//     return { accessToken: newAccessToken, refreshToken: newRefreshToken };
//   }

//   async updateProfile(userId: string, dto: UpdateProfileDTO) {
//     return this.profileRepository.update(userId, dto);
//   }

//   async getCurrentUser(userId: string) {
//     const user = await this.profileRepository.findById(userId);
//     if (!user) {
//       throw new AppError('User not found', 404);
//     }
//     return this.mapUserToDTO(user);
//   }

//   private mapUserToDTO(user: Omit<Profile, 'password'> & { password?: string }): UserDTO {
//     const { password, ...userWithoutPassword } = user;
//     return {
//       ...userWithoutPassword,
//       role: userWithoutPassword.role || 'user',
//       phone: userWithoutPassword.phone,
//       country: userWithoutPassword.country,
//       avatarUrl: userWithoutPassword.avatarUrl,
//       isAdmin: userWithoutPassword.role === 'admin',
//     };
//   }
// }



import { ProfileRepository } from '../repositories/profileRepository';
import { PasswordUtil } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, UserDTO } from '../types/dto/auth.dto';
import { AppError } from '../utils/error.util';
import type { Profile } from '@prisma/client';

export class AuthService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async register(dto: RegisterDTO) {
    const normalizedEmail = dto.email.toLowerCase();
    const existingUser = await this.profileRepository.findByEmail(normalizedEmail);
    if (existingUser) throw new AppError('Email already registered', 409);

    const hashedPassword = await PasswordUtil.hash(dto.password);
    const user = await this.profileRepository.create({
      email: normalizedEmail,
      name: dto.name,
      password: hashedPassword,
      role: 'user',
    });

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: this.mapUserToDTO(user),
        accessToken,
        refreshToken,
      },
    };
  }

  async login(dto: LoginDTO) {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.profileRepository.findByEmail(normalizedEmail);

    if (!user || !user.password) throw new AppError('Invalid credentials', 401);

    const isPasswordValid = await PasswordUtil.compare(dto.password, user.password);
    if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: this.mapUserToDTO(user),
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    const newAccessToken = generateAccessToken(newPayload as JwtPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.profileRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return {
      success: true,
      message: 'User retrieved successfully',
      data: this.mapUserToDTO(user),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO) {
    return this.profileRepository.update(userId, dto);
  }

  private mapUserToDTO(user: Omit<Profile, 'password'> & { password?: string }): UserDTO {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: userWithoutPassword.role || 'user',
      phone: userWithoutPassword.phone,
      country: userWithoutPassword.country,
      avatarUrl: userWithoutPassword.avatarUrl,
      isAdmin: userWithoutPassword.role === 'admin',
    };
  }
}
