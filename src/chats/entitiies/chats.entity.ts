import { BaseModel } from "src/common/entities";
import { UsersModel } from "src/users/entities";
import { Entity, ManyToMany } from "typeorm";

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, user => user.chats)
  users: UsersModel[];
}
