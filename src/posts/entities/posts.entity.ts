import { IsString } from "class-validator";
import { BaseEntity } from "src/common";
import { stringValidationMessage } from "src/common/validation-message";
import { UsersModel } from "src/users/entities/users.entitiy";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class PostsModel extends BaseEntity {
  @ManyToOne(() => UsersModel, user => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column({
    generated: "increment",
  })
  postNum: number;

  @IsString({
    message: stringValidationMessage,
  })
  @Column()
  title: string;

  @IsString({
    message: stringValidationMessage,
  })
  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
