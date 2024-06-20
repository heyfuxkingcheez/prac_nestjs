import { PickType } from "@nestjs/mapped-types";
import { CommentsModel } from "../entities/comment.entity";

export class CreateCommentReqDto extends PickType(CommentsModel, ["comment"]) {}
