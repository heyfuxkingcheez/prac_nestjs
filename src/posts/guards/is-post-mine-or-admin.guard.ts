import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RolesEnum } from "src/users/const/roles.const";
import { PostsService } from "../posts.service";
import { UsersModel } from "src/users/entities";
import { Request } from "express";

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user)
      throw new UnauthorizedException("사용자 정보를 가져올 수 없습니다");

    if (user.role === RolesEnum.ADMIN) return true;

    const postId = req.params.postId;

    if (!postId)
      throw new BadRequestException("Post ID가 파라미터로 제공 되어야 합니다.");

    const isOk = await this.postsService.isPostMine(user.id, postId);

    if (!isOk) throw new ForbiddenException("권한이 없습니다.");

    return true;
  }
}
