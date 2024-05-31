import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './../../common/base.entity';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities';
import { IsEmail, IsString, Length } from 'class-validator';
import {
  emailValidationMessage,
  lengthValidationMessage,
  stringValidationMessage,
} from 'src/common/validation-message';

@Entity()
export class UsersModel extends BaseEntity {
  @Column({ length: 20, unique: true, nullable: false })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  @Column({ unique: true, nullable: false })
  email: string;

  @IsString({
    message: stringValidationMessage,
  })
  @Length(8, 20, {
    message: lengthValidationMessage,
  })
  @Column({ nullable: false })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
