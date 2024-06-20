import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsModel } from "./entities/comment.entity";
import { AuthModule } from "src/auth/auth.module";
import { PostsModule } from "../posts.module";
import { CommonModule } from "src/common/common.module";
import { UsersModule } from "src/users/users.module";
import { PostExistsMiddleware } from "./middlewares/post-exists.middleware";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]),
    PostsModule,
    AuthModule,
    CommonModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
