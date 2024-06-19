import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { EnterChatDto } from "./dto/enter-chat.dto";
import { CreateMessagesDto } from "./messages/dto/create-messages.dto";
import { MessagesService } from "./messages/messages.service";
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { SocketCatchHttpExceptionFilter } from "src/common/exception-filter/socket-catch-http.exceptionfilter";
import { ScoketBearerTokenGuard } from "src/auth/guard";
import { UsersModel } from "src/users/entities";
import { UsersService } from "src/users/users.service";
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: "chats",
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @WebSocketServer()
  server: Server;

  // 게이트웨이가 초기화 됐을 때
  afterInit(server: any) {
    console.log("after gateway init ");
  }

  // 게이트웨이 연결이 끊겼을 때
  handleDisconnect(socket: any) {
    console.log(`on disconnect called : ${socket.id}`);
  }

  // 게이트웨이 연결 됐을 때
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called : ${socket.id}`);

    const headers = socket.handshake.headers;

    const rawToken = headers["authorization"];
    console.log(rawToken);

    if (!rawToken) socket.disconnect();

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);

      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (error) {
      console.log(error);
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("create_chat")
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("enter_chat")
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId : ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map(x => x.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // sockst.on('send_message), (message) => {console.log(message)}`);
  @SubscribeMessage("send_message")
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID: ${dto.chatId}`,
      );
    }

    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    );

    socket
      .to(message.chat.id)
      .emit("receive_message", `${socket.id} : ${dto.message}`);
  }
}
