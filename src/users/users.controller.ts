import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Roles } from "./decorator/roles.decorator";
import { RolesEnum } from "./const/roles.const";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }
}
