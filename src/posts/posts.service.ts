import { Injectable, NotFoundException } from "@nestjs/common";
import {
  FindOptionsWhere,
  LessThan,
  MoreThan,
  QueryRunner,
  Repository,
} from "typeorm";
import { PostsModel } from "./entities";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostReqDto, UpdatePostReqDto } from "./dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { ConfigService } from "@nestjs/config";
import { CommonService } from "src/common/common.service";
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
      lastItem && new URL(`${this.configService.get<string>("URL")}/posts`);

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
  async getPostById(id: string, qr?: QueryRunner): Promise<PostsModel | null> {
    try {
      const repository = this.getRepository(qr);
      const post = await repository.findOne({
        ...DEFAULT_POST_FIND_OPTIONS,
        where: { id },
      });

      if (!post) throw new NotFoundException();

      return post;
    } catch (error) {
      console.log(error);
    }
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel)
      : this.postsRepo;
  }

  async incrementCommentCount(postId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.increment(
      {
        id: postId,
      },
      "commentCount",
      1,
    );
  }

  async decrementCommentCount(postId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.decrement(
      {
        id: postId,
      },
      "commentCount",
      1,
    );
  }

  async createPost(
    authorId: string,
    dto: CreatePostReqDto,
    qr?: QueryRunner,
  ): Promise<PostsModel> {
    const repo = this.getRepository(qr);

    try {
      const post = repo.create({
        author: {
          id: authorId,
        },
        ...dto,
        images: [],
        likeCount: 0,
        commentCount: 0,
      });

      const newPost = await repo.save(post);

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

    if (!post) throw new NotFoundException();

    return await this.postsRepo.delete(postId);
  }

  async checkPostExistsById(postId: string): Promise<boolean> {
    return await this.postsRepo.exists({
      where: {
        id: postId,
      },
    });
  }

  async isPostMine(userId: string, postId: string) {
    return this.postsRepo.exists({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
