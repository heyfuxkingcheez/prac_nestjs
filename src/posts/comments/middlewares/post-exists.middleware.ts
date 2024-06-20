import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { PostsService } from "src/posts/posts.service";

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postService: PostsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException("Post ID 파라미터는 필수 입니다.");
    }

    const exists = await this.postService.checkPostExistsById(postId);

    if (!exists) throw new NotFoundException("Post가 존재하지 않습니다");

    next();
  }
}
