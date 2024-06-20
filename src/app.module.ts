import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PostsModule } from "./posts/posts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { CommonModule } from "./common/common.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER_PATH } from "./common/const/path.const";
import { LogMiddleWare } from "./common/middlewares/log.middleware";
import { ChatsModule } from "./chats/chats.module";
import { CommentsModule } from "./posts/comments/comments.module";
import { RolesGuard } from "./users/guards/roles.guard";
import { AccessTokenGuard } from "./auth/guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        autoLoadEntities: true,
        synchronize: configService.get<string>("RUNTIME") !== "prod",
      }),
    }),
    UsersModule,
    PostsModule,
    AuthModule,
    CommonModule,
    ChatsModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: "/public",
    }),
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleWare).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
