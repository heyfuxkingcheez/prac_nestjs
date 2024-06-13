import { PickType } from "@nestjs/mapped-types";
import { ImageModel } from "src/common/entities";

export class CreatePostImageDto extends PickType(ImageModel, [
  "path",
  "post",
  "order",
  "type",
]) {}
