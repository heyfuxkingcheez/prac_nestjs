import { Body, Controller, Headers, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserReqDto } from "./dto";

import { BsaicTokenGuard } from "./guard/basic-token.guard";
import { RefreshTokenGuard } from "./guard/bearer-token.guard";
import { IsPublic } from "src/common/decorators/is-public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post("token/refresh")
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    return {
      RefreshToken: newToken,
    };
  }

  @Post("login")
  @IsPublic()
  @UseGuards(BsaicTokenGuard)
  postLoginEamil(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post("register")
  @IsPublic()
  postRegisterEmail(@Body() dto: RegisterUserReqDto) {
    return this.authService.registerWithEmail(dto);
  }
}
