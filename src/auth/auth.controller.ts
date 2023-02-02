import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  signUp(
    @Body() dto: AuthDto,
    // @Body('email') email: string,
    // @Body('passcode') passcode: string,
    // @Body('passcode') passcode: ParseIntPipe, //To change the passcode string to int
  ) {
    try {
      return this.authService.signUp(dto);
    } catch (error) {
      console.log(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('signIn')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
