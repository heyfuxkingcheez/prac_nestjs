import { CanActivate, ExecutionContext } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

export class ScoketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();

    const headers = socket.handshake.headers;
    console.log(headers.authorization);

    const rawToken = headers["authoriztion"];

    if (!rawToken) throw new WsException("토큰이 없습니다.");

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);

      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.type;

      return true;
    } catch (error) {
      throw new WsException("토큰이 유효하지 않습니다.");
    }
  }
}
