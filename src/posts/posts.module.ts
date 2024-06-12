import { BadRequestException, Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsModel } from "./entities";
import { PostsController } from "./posts.controller";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { CommonModule } from "src/common/common.module";
import { MulterModule } from "@nestjs/platform-express";
import { extname } from "path";
import * as multer from "multer";
import { POST_IMAGE_PATH } from "src/common/const/path.const";
import { v4 as uuid } from "uuid";

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register({
      limits: {
        fileSize: 50000000,
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(에러, boolean)
         *
         * 첫 번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
         * 두 번쨰 파라미터에는 파일을 받을지 말지 boolean을 넣어준다.
         */
        //xxx.jpg => .jpg

        const ext = extname(file.originalname);

        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
          return cb(
            new BadRequestException(
              "jpg/jpeg/png 형식의 파일만 업로드 가능합니다.",
            ),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          // 123123-12314-123124-12312.png
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
