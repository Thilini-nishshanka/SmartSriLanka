
import { RegisterDTO } from "@/types/dto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class AuthRepository {

    private model = prisma.profile;

  static async createUser(data: RegisterDTO) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.profile.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'user', // default role
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.model.findUnique({
      where: { email },
    });
  }
}
