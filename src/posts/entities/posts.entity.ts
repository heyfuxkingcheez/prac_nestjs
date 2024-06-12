import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { join } from "path";
import { BaseEntity } from "src/common";
import { POST_PUBLIC_IMAGE_PATH } from "src/common/const/path.const";
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

  @Column({
    nullable: true,
  })
  @Transform(
    ({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`,
  )
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
