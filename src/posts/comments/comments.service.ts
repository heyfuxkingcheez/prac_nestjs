import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Patch,
} from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { CreateCommentReqDto } from "./dto/create-comment-req.dto";
import { Repository } from "typeorm";
import { CommentsModel } from "./entities/comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateCommentReqDto } from "./dto/update-comment-req.dto";
import { PaginateCommentsDto } from "./dto/paginate-comment.dto";
import { DEFAULT_COMMENT_FIND_OPTIONS } from "./const/default-comment-find-options.const";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepo: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateComments(dto: PaginateCommentsDto, postId: string) {
    return this.commonService.paginate(
      dto,
      this.commentsRepo,
      {
        where: {
          post: {
            id: postId,
          },
        },
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(commentId: string): Promise<CommentsModel | null> {
    const comment = await this.commentsRepo.findOne({
      where: {
        id: commentId,
      },
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });

    if (!comment)
      throw new NotFoundException(
        `id: ${commentId} Comment는 존재하지 않습니다.`,
      );

    return comment;
  }

  async createComment(
    postId: string,
    authorId: string,
    dto: CreateCommentReqDto,
  ): Promise<CommentsModel> {
    const comment = this.commentsRepo.create({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...dto,
    });

    const newComment = await this.commentsRepo.save(comment);

    return newComment;
  }

  async updateComment(commentId: string, dto: UpdateCommentReqDto) {
    const comment = await this.commentsRepo.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) throw new BadRequestException();

    const updatedComment = await this.commentsRepo.preload({
      id: commentId,
      ...dto,
    });

    return await this.commentsRepo.save(updatedComment);
  }

  async deleteComment(commentId: string, authorId: string) {
    const comment = await this.commentsRepo.findOne({
      where: {
        id: commentId,
        author: {
          id: authorId,
        },
      },
    });

    if (!comment) throw new NotFoundException("존재하지 않는 댓글 입니다.");

    return await this.commentsRepo.delete(commentId);
  }

  async isCommentMine(userId: string, commentId: string) {
    return await this.commentsRepo.exists({
      where: {
        id: commentId,
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
