import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { promises } from "fs";
import { basename, join } from "path";
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from "src/common/const/path.const";
import { ImageModel } from "src/common/entities";
import { QueryRunner, Repository } from "typeorm";
import { CreatePostImageDto } from "./dto/create-image.dto";

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imagesRepo: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imagesRepo;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repo = this.getRepository(qr);

    // dto의 이미지 이름을 기반으로
    // 파일에 경로를 생성한다.

    const tmepFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      // 파일 존재하는지 확인
      // 만약 존재하지 않는다면 에러를 던짐
      await promises.access(tmepFilePath);
    } catch (error) {
      throw new BadRequestException("존재하지 않는 파일 입니다.");
    }

    // 파일의 이름만 가져오기
    // /users/aaa/bbb/ccc/asd.jpg => asd.jpg
    const fileName = basename(tmepFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이동
    // {프로젝트 경로}/public/posts/asdf.jpg
    const newPath = join(POST_IMAGE_PATH, fileName);

    //save
    const result = await repo.save({
      ...dto,
    });

    // 파일 옮기기
    await promises.rename(tmepFilePath, newPath);

    return true;
  }
}
