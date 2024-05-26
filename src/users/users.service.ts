import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entitiy';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepo: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    const nicknameExists = await this.userRepo.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists)
      throw new BadRequestException('이미 존재하는 닉네임 입니다.');

    const emailExists = await this.userRepo.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists)
      throw new BadRequestException('이미 가입한 이메일 입니다.');

    const userObject = this.userRepo.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.userRepo.save(userObject);

    return newUser;
  }

  async getAllUsers() {
    const users = await this.userRepo.find();

    if (!users) throw new NotFoundException();

    return users;
  }

  async getUserByEmail(email: string) {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }
}
