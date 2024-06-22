import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "./entities/users.entitiy";
import { Repository } from "typeorm";
import { UserFollowersModel } from "./entities";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepo: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepo: Repository<UserFollowersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, "email" | "nickname" | "password">) {
    const nicknameExists = await this.userRepo.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists)
      throw new BadRequestException("이미 존재하는 닉네임 입니다.");

    const emailExists = await this.userRepo.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists)
      throw new BadRequestException("이미 가입한 이메일 입니다.");

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

  async followUser(followerId: string, followeeId: string) {
    const result = await this.userFollowersRepo.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async getFollowers(userId: string, includeNotConfirmed: boolean) {
    const where = {
      followee: {
        id: userId,
      },
    };

    if (!includeNotConfirmed) {
      where["isConfirmed"] = true;
    }

    const result = await this.userFollowersRepo.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });
    return result.map(x => ({
      id: x.follower.id,
      nickname: x.follower.nickname,
      email: x.follower.email,
      isConfirmed: x.isConfirmed,
    }));
  }

  async confirmFollow(
    followerId: string,
    followeeId: string,
  ): Promise<boolean> {
    const existing = await this.userFollowersRepo.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        followee: true,
        follower: true,
      },
    });

    if (!existing)
      throw new NotFoundException("존재하지 않는 팔로우 요청입니다.");

    await this.userFollowersRepo.save({
      ...existing,
      isConfirmed: true,
    });

    return true;
  }

  async deleteFollow(followerId: string, followeeId: string) {
    await this.userFollowersRepo.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }
}
