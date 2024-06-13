import { BadRequestException, Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
import { MulterModule } from "@nestjs/platform-express";
import { extname } from "path";
import * as multer from "multer";
import { TEMP_FOLDER_PATH } from "./const/path.const";
import { v4 as uuid } from "uuid";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageModel } from "./entities";
import { PostsModule } from "src/posts/posts.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageModel]),
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
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          // 123123-12314-123124-12312.png
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
