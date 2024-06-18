import { IsString } from "class-validator";

export class CreateChatDto {
  @IsString({ each: true })
  userIds: string[];
}
