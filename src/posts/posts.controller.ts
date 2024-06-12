import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
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
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
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
  async createPost(
    @Body() dto: CreatePostReqDto,
    @User("id") userId: string,
  ): Promise<PostsModel> {
    await this.postsService.createPostImage(dto);

    return await this.postsService.createPost(userId, dto);
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
