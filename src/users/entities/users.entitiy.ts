import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "src/posts/entities";
import { IsEmail, IsString, Length } from "class-validator";
import {
  emailValidationMessage,
  lengthValidationMessage,
  stringValidationMessage,
} from "src/common/validation-message";
import { Exclude } from "class-transformer";
import { BaseModel } from "src/common/entities";
import { ChatsModel } from "src/chats/entitiies/chats.entity";
import { MessagesModel } from "src/chats/messages/entities/messages.entity";
import { CommentsModel } from "src/posts/comments/entities/comment.entity";
import { UserFollowersModel } from "./user-followers.entity";

@Entity()
export class UsersModel extends BaseModel {
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
  /**
   * Request
   * frontend -> backend
   * plain obj (JSON) -> class instance (DTO)
   *
   * Response
   * backend -> frontend
   * class instance (DTO) -> plain obj (JSON)
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, post => post.author, {
    cascade: true,
  })
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, chat => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, message => message.author)
  messages: MessagesModel;

  @OneToMany(() => CommentsModel, comment => comment.author, {
    cascade: true,
  })
  postComments: CommentsModel[];

  @OneToMany(() => UserFollowersModel, ufm => ufm.follower, { cascade: true })
  @JoinTable()
  followers: UserFollowersModel[];

  @OneToMany(() => UserFollowersModel, ufm => ufm.following, { cascade: true })
  followings: UserFollowersModel[];

  @Column({ default: 0 })
  followerCount: number;

  @Column({ default: 0 })
  followingCount: number;
}
