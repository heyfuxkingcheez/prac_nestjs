import { IsString } from "class-validator";

export class EnterChatDto {
  @IsString({ each: true })
  chatIds: string[];
}
