import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { AccessTokenGuard } from "src/auth/guard";
import { CreateCommentReqDto } from "./dto/create-comment-req.dto";
import { User } from "src/users/decorator";
import { CommentsModel } from "./entities/comment.entity";
import { UpdateCommentReqDto } from "./dto/update-comment-req.dto";
import { PaginateCommentsDto } from "./dto/paginate-comment.dto";
import { IsPublic } from "src/common/decorators/is-public.decorator";
import { IsCommentMineOrAdminGuard } from "./guards/is-comment-mine-or-admin.guard";

@Controller("posts/:postId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  /**
   *  1) Entity 생성
   *  author -> 작성자
   *  post -> 귀속되는 포스트
   *  comment -> 실제 댓글 내용
   *  likeCount -> 좋아요 갯수
   *
   *  id -> PrimaryGeneratedColumn
   *  createdAt -> 생성 일자
   *  updatedAt -> 수정 일자
   *
   *  2) GET() pagination
   *  3) GET(':commentId') 특정 comment만 가져오는 기능
   *  4) POST() 코멘트 생성하는 기능
   *  5) PATCH('commentId') 특정 comment 수정 하는 기능
   *  6) DELETE('commentId) 특정 comment 삭제 하는 기능
   */
  @Get()
  @IsPublic()
  getComments(
    @Param("postId", ParseUUIDPipe) postId: string,
    @Query() dto: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(dto, postId);
  }

  @Get(":commentId")
  @IsPublic()
  async getCommentById(
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ): Promise<CommentsModel> {
    const comment = await this.commentsService.getCommentById(commentId);

    return comment;
  }

  @Post()
  async createComment(
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentReqDto,
    @User("id", ParseUUIDPipe) userId: string,
  ): Promise<CommentsModel> {
    const comment = await this.commentsService.createComment(
      postId,
      userId,
      dto,
    );
    return comment;
  }

  @Patch(":commentId")
  @UseGuards(IsCommentMineOrAdminGuard)
  async updateComment(
    @Body() dto: UpdateCommentReqDto,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ): Promise<CommentsModel> {
    const comment = await this.commentsService.updateComment(commentId, dto);
    return comment;
  }

  @Delete(":commentId")
  @UseGuards(IsCommentMineOrAdminGuard)
  async deleteComment(
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @User("id", ParseUUIDPipe) userId: string,
  ) {
    const comment = await this.commentsService.deleteComment(commentId, userId);

    return { HttpCode: 200, HttpStatus: "OK", message: "삭제 완료" };
  }
}
