import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatsModel } from "./entitiies/chats.entity";
import { Repository } from "typeorm";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepo: Repository<ChatsModel>,
  ) {}

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
}
