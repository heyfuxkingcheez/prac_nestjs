import { PickType } from "@nestjs/mapped-types";
import { MessagesModel } from "../entities/messages.entity";
import { IsString } from "class-validator";

export class CreateMessagesDto extends PickType(MessagesModel, ["message"]) {
  @IsString()
  chatId: string;

  @IsString()
  authorId: string;
}
