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
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsModel } from "./entities";
import { CreatePostReqDto, UpdatePostReqDto } from "./dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { User } from "src/users/decorator";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { UsersModel } from "src/users/entities";
import { ImageModelType } from "src/common/entities";
import { DataSource } from "typeorm";
import { PostsImagesService } from "./images/images.service";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

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
    // 트랜잭션과 관련된 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결한다.
    await qr.connect();

    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.
    await qr.startTransaction();

    // 로직 실행
    try {
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
      // 쿼리를 커밋한다.
      await qr.commitTransaction();
      // 쿼리 러너를 종료한다.
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (error) {
      // 어떤 에러든 에러가 생기면
      // 롤백한다.
      await qr.rollbackTransaction();
      // 쿼리 러너를 종료한다.
      await qr.release();

      throw new InternalServerErrorException("에러 발생");
    }
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
