import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthDto) {
    const hash = await argon.hash(dto.passcode);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        // select: {
        //   id: true,
        //   email: true,
        //   createdAt: true,
        // },
      });

      // delete user.passcode;
      // return user;
      return this.signtoken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Email Credentials Incorrect');
    }

    const pwMatches = await argon.verify(user.hash, dto.passcode);

    if (!pwMatches) {
      throw new ForbiddenException('Passcode Credentials Incorrect');
    }

    return this.signtoken(user.id, user.email);
    // const secretKey = await this.signtoken(user.id, user.email);
    // return {
    //   ...user,
    //   access_token: secretKey,
    // };
  }

  async signtoken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payLoad = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payLoad, {
      expiresIn: '150m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  // signtoken(id: number, email: string): Promise<string> {
  //   const payload = {
  //     sub: id,
  //     email,
  //   };
  //   const secret = this.config.get('JWT_SECRET');
  //   return this.jwt.signAsync(payload, {
  //     expiresIn: '150m',
  //     secret: secret,
  //   });
  // }
}
