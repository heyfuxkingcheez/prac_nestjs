import {
  Body,
  Controller,
  Delete,
  Get,
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
import { User } from "src/users/decorator";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { UsersModel } from "src/users/entities";
import { ImageModelType } from "src/common/entities";
import { QueryRunner as QR } from "typeorm";
import { PostsImagesService } from "./images/images.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { QueryRunner } from "src/common/decorators/query-runner.decorator";
import { Roles } from "src/users/decorator/roles.decorator";
import { RolesEnum } from "src/users/const/roles.const";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { IsPostMineOrAdminGuard } from "./guards/is-post-mine-or-admin.guard";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  @Get()
  @IsPublic()
  // @UseInterceptors(LogInterceptor)
  getAllPosts(@Query() Query: PaginatePostDto) {
    return this.postsService.paginatePosts(Query);
  }

  @Get(":postId")
  @UseGuards(IsPostMineOrAdminGuard)
  async getPostById(
    @Param("postId", ParseUUIDPipe) id: string,
  ): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @Body() dto: CreatePostReqDto,
    @User("id") userId: string,
    @QueryRunner() qr: QR,
  ): Promise<PostsModel> {
    // 로직 실행

    const post = await this.postsService.createPost(userId, dto, qr);

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

  @Patch(":postId")
  async updatePost(
    @Param("postId", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostReqDto,
  ): Promise<PostsModel> {
    return await this.postsService.updatePost(id, dto);
  }

  @Delete(":postId")
  @Roles(RolesEnum.ADMIN)
  async deletePost(@Param("postId", ParseUUIDPipe) id: string) {
    return await this.postsService.deletePost(id);
  }

  // 포스트 생성기 테스트용
  @Post("random")
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }
}
