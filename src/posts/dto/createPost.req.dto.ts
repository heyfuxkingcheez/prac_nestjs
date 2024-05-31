import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities';

// Pick, Omit, Partial -> Type을 반환
// PickType, OmitType, PartialType -> 값을 반환
export class CreatePostReqDto extends PickType(PostsModel, [
  'title',
  'content',
]) {}
