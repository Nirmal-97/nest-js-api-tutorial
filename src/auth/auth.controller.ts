import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  signUp(@Req() req: Request) {
    console.log(req.body);
    return this.authService.signUp(req.body);
  }

  @Post('signIn')
  signIn() {
    return this.authService.signIn;
  }
}
