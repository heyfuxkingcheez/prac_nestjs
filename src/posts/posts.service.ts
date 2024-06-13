import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  FindOptionsWhere,
  LessThan,
  MoreThan,
  Repository,
} from "typeorm";
import { PostsModel } from "./entities";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostReqDto, UpdatePostReqDto } from "./dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { ConfigService } from "@nestjs/config";
import { CommonService } from "src/common/common.service";
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from "src/common/const/path.const";
import { promises } from "fs";
import { basename, join } from "path";
import { CreatePostImageDto } from "./images/dto/create-image.dto";
import { ImageModel } from "src/common/entities";
import { DEFAULT_POST_FIND_OPTIONS } from "./const/default-post-find-options.const";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepo: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imagesRepo: Repository<ImageModel>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return await this.postsRepo.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  // 포스트 생성기 테스트용
  async generatePosts(userId: string) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
        images: [],
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepo,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      "posts",
    );
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    /**
     * data: Data[],
     * total: number,
     *
     * [1], [2], [3], [4]
     */
    const [posts, count] = await this.postsRepo.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });
    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__postNum__less_than) {
      where.postNum = LessThan(dto.where__postNum__less_than);
    } else if (dto.where__postNum__more_than) {
      where.postNum = MoreThan(dto.where__postNum__more_than);
    }

    const posts = await this.postsRepo.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const nextURL =
      lastItem &&
      new URL(`${this.configService.get<string>("URL")}/posts`);

    if (nextURL) {
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 벨류가 존재하면
       * param에 그대로 붙여넣는다.
       *
       * 단, where__postNum_more_than 값만 lastItem의 마지막 값으로 넣어준다.
       */

      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== "where__postNum__more_than" &&
            key !== "where__postNum__less_than"
          ) {
            nextURL.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === "ASC") {
        key = "where__postNum__more_than";
      } else {
        key = "where__postNum__less_than";
      }

      nextURL.searchParams.append(key, lastItem.postNum.toString());
    }

    /**
     * Response
     *
     * data: Data[,
     * cursor: {
     * after: 마지막 Data의 ID
     * },
     * count: 응답한 데이터의 갯수
     * next: 다음 요청을 할때 사용할 URL
     * ]
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.postNum ?? null,
      },
      count: posts.length,
      next: nextURL?.toString() ?? null,
    };
  }
  async getPostById(id: string): Promise<PostsModel | null> {
    try {
      const post = await this.postsRepo.findOne({
        ...DEFAULT_POST_FIND_OPTIONS,
        where: { id },
      });

      if (!post) throw new NotFoundException();

      return post;
    } catch (error) {
      console.log(error);
    }
  }

  async createPostImage(dto: CreatePostImageDto) {
    // dto의 이미지 이름을 기반으로
    // 파일에 경로를 생성한다.

    const tmepFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      // 파일 존재하는지 확인
      // 만약 존재하지 않는다면 에러를 던짐
      await promises.access(tmepFilePath);
    } catch (error) {
      throw new BadRequestException("존재하지 않는 파일 입니다.");
    }

    // 파일의 이름만 가져오기
    // /users/aaa/bbb/ccc/asd.jpg => asd.jpg
    const fileName = basename(tmepFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이동
    // {프로젝트 경로}/public/posts/asdf.jpg
    const newPath = join(POST_IMAGE_PATH, fileName);

    //save
    const result = await this.imagesRepo.save({
      ...dto,
    });

    // 파일 옮기기
    await promises.rename(tmepFilePath, newPath);

    return true;
  }

  async createPost(
    authorId: string,
    dto: CreatePostReqDto,
  ): Promise<PostsModel> {
    try {
      const post = this.postsRepo.create({
        author: {
          id: authorId,
        },
        ...dto,
        images: [],
        likeCount: 0,
        commentCount: 0,
      });

      const newPost = await this.postsRepo.save(post);

      return newPost;
    } catch (error) {
      console.log(error);
    }
  }

  async updatePost(id: string, dto: UpdatePostReqDto) {
    const post = await this.postsRepo.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!post) throw new NotFoundException();
    if (dto.title) post.title = dto.title;
    if (dto.content) post.content = dto.content;

    const updatedPost = await this.postsRepo.save(post);

    return updatedPost;
  }

  async deletePost(postId: string) {
    const post = await this.postsRepo.findOne({
      where: {
        id: postId,
      },
    });
    console.log(post);

    if (!post) throw new NotFoundException();

    return await this.postsRepo.delete(postId);
  }
}
