import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserReqDto } from './dto/createUser.req.dto';
import { PasswordPipe } from './pipe/password.pipe';
import { BsaicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    return {
      RefreshToken: newToken,
    };
  }

  @Post('login')
  @UseGuards(BsaicTokenGuard)
  postLoginEamil(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register')
  postRegisterEmail(@Body() dto: CreateUserReqDto) {
    const passwordValidationPipe = new PasswordPipe();
    dto.password = passwordValidationPipe.transform(dto.password, {
      type: 'body',
      data: 'password',
    });
    return this.authService.registerWithEmail(dto);
  }
}
