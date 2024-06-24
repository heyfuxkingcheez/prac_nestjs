import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Roles } from "./decorator/roles.decorator";
import { RolesEnum } from "./const/roles.const";
import { User } from "./decorator";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { QueryRunner as QR } from "typeorm";
import { QueryRunner } from "src/common/decorators/query-runner.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // RBAC Role Based Access Control
  @Roles(RolesEnum.ADMIN)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get("follow/me")
  async getFollow(
    @User("id", ParseUUIDPipe) userId: string,
    @Query("includeNotConfirmed", new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(userId, includeNotConfirmed);
  }

  @Post("follow/:userId")
  async createFollow(
    @User("id", ParseUUIDPipe) userId: string,
    @Param("userId", ParseUUIDPipe) followingId: string,
  ) {
    await this.usersService.followUser(userId, followingId);

    return true;
  }

  @Patch("follow/:followerId/confirm")
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User("id", ParseUUIDPipe) followingId: string,
    @Param("followerId", ParseUUIDPipe) followerId: string,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.confirmFollow(followerId, followingId, qr);

    await this.usersService.incrementFollowerCount(followingId, qr);

    return true;
  }

  @Delete("follow/:followingId")
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User("id") userId: string,
    @Param("followingId", ParseUUIDPipe) followingId: string,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.deleteFollow(userId, followingId, qr);

    await this.usersService.decrementFollowerCount(followingId, qr);

    return true;
  }
}
