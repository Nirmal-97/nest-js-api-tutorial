import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(req) {
    const user = await this.prisma.user.create({
      data: {
        email: req.email,
        hash: req.password,
      },
    });
    return user;
  }

  signIn() {
    return { msg: 'I am signed in' };
  }
}
