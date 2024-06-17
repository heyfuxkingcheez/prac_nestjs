import { IsString } from "class-validator";
import { ChatsModel } from "src/chats/entitiies/chats.entity";
import { BaseModel } from "src/common/entities";
import { UsersModel } from "src/users/entities";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, chat => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, user => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
