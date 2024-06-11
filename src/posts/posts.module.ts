import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModel } from "./entities";
import { PostsController } from "./posts.controller";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule, ConfigModule, CommonModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
