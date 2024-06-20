import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  /**
   * Roles annotation에 대한 metadata를 가져와야 한다.
   *
   * Reflector
   * getAllAndOverride()
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) throw new UnauthorizedException("토큰이 없습니다.");

    if (user.role !== requiredRole)
      throw new ForbiddenException(
        `이 작업을 수행할 수 없습니다. ${requiredRole} 권한이 필요합니다.`,
      );

    return true;
  }
}
