import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from 'src/users/entities';

export class RegisterUserReqDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {}
