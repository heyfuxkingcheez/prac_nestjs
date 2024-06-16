import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsModel } from "./entities";
import { CreatePostReqDto, UpdatePostReqDto } from "./dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { User } from "src/users/decorator";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { UsersModel } from "src/users/entities";
import { ImageModelType } from "src/common/entities";
import { DataSource, QueryRunner as QR } from "typeorm";
import { PostsImagesService } from "./images/images.service";
import { LogInterceptor } from "src/common/interceptors/log.interceptor";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { QueryRunner } from "src/common/decorators/query-runner.decorator";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  @Get()
  @UseInterceptors(LogInterceptor)
  async getAllPosts(@Query() Query: PaginatePostDto) {
    return this.postsService.paginatePosts(Query);
  }
  @Get(":id")
  async getPostById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @Body() dto: CreatePostReqDto,
    @User("id") userId: string,
    @QueryRunner() qr: QR,
  ): Promise<PostsModel> {
    // 로직 실행

    const post = await this.postsService.createPost(
      userId,
      dto,
      qr,
    );

    for (let i = 0; i < dto.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i,
          path: dto.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }

    return this.postsService.getPostById(post.id, qr);
  }

  @Patch(":id")
  async updatePost(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostReqDto,
  ): Promise<PostsModel> {
    return await this.postsService.updatePost(id, dto);
  }

  @Delete(":id")
  async deletePost(@Param("id", ParseUUIDPipe) id: string) {
    return await this.postsService.deletePost(id);
  }

  // 포스트 생성기 테스트용
  @Post("random")
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }
}
