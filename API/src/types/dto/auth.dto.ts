export class RegisterDTO {
  name!: string;
  email!: string;
  password!: string;
}

export class LoginDTO {
  email!: string;
  password!: string;
}

export class UpdateProfileDTO {
  name?: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
}

export class RefreshTokenDTO {
  refreshToken!: string;
}

export class UserDTO {
  id!: string;
  email!: string;
  name!: string;
  role!: 'admin' | 'user';
  phone!: string | null;
  country!: string | null;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  isAdmin!: boolean; // Add explicit admin flag for easier frontend handling
}

export class AuthResponseDTO {
  success!: boolean;
  message!: string;
  data!: {
    user: UserDTO;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutDto {
  refreshToken: string;
}
