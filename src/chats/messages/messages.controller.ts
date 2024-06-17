import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

@Controller("chats/:cid/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  paginateMessage(
    @Query() dto: BasePaginationDto,
    @Param("cid", ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.paginateMessages(dto, {
      where: {
        chat: {
          id,
        },
      },
      relations: {
        author: true,
        chat: true,
      },
    });
  }
}
