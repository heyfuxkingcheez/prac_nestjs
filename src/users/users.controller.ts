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
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Roles } from "./decorator/roles.decorator";
import { RolesEnum } from "./const/roles.const";
import { User } from "./decorator";

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
    @Param("userId", ParseUUIDPipe) followeeId: string,
  ) {
    await this.usersService.followUser(userId, followeeId);

    return true;
  }

  @Patch("follow/:followerId/confirm")
  async patchFollowConfirm(
    @User("id", ParseUUIDPipe) followeeId: string,
    @Param("followerId", ParseUUIDPipe) followerId: string,
  ) {
    this.usersService.confirmFollow(followerId, followeeId);

    return true;
  }

  @Delete("follow/:followeeId")
  async deleteFollow(
    @User("id") userId: string,
    @Param("followeeId", ParseUUIDPipe) followeeId: string,
  ) {
    this.usersService.deleteFollow(userId, followeeId);

    return true;
  }
}
