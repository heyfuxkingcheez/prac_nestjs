import { IsString } from "class-validator";
import { BaseModel, ImageModel } from "src/common/entities";
import { stringValidationMessage } from "src/common/validation-message";
import { UsersModel } from "src/users/entities/users.entitiy";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
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

  @OneToMany(type => ImageModel, image => image.post)
  images: ImageModel[];
}
