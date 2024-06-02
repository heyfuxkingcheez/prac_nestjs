import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModel } from "./entities";
import { PostsController } from "./posts.controller";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule, ConfigModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
