import { IsNumber, IsString } from "class-validator";
import { BaseModel } from "src/common/entities";
import { stringValidationMessage } from "src/common/validation-message";
import { PostsModel } from "src/posts/entities";
import { UsersModel } from "src/users/entities";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, user => user.postComments, {
    nullable: false,
    onDelete: "CASCADE",
  })
  author: UsersModel;

  @ManyToOne(() => PostsModel, post => post.comments, {
    nullable: false,
    onDelete: "CASCADE",
  })
  post: PostsModel;

  @Column({ nullable: false })
  @IsString({
    message: stringValidationMessage,
  })
  comment: string;

  @Column({ default: 0 })
  @IsNumber()
  likeCount: number;
}
