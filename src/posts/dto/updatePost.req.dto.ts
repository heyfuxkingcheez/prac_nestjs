import { PartialType } from '@nestjs/mapped-types';
import { CreatePostReqDto } from './createPost.req.dto';
import { IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message';

export class UpdatePostReqDto extends PartialType(CreatePostReqDto) {
  @IsString({ message: stringValidationMessage })
  @IsOptional()
  title?: string;

  @IsString({ message: stringValidationMessage })
  @IsOptional()
  content?: string;
}
