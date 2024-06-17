import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatsModel } from "./entitiies/chats.entity";
import { Repository } from "typeorm";
import { CreateChatDto } from "./dto/create-chat.dto";
import { CommonService } from "src/common/common.service";
import { PaginateChatsDto } from "./dto/paginate-chat.dto";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepo: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatsDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepo,
      { relations: { users: true } },
      "chats",
    );
  }

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepo.save({
      users: dto.userIds.map(id => ({ id })),
    });

    return this.chatsRepo.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  async checkIfChatExists(chatId: string) {
    const exists = await this.chatsRepo.exists({
      where: {
        id: chatId,
      },
    });
    return exists;
  }
}
