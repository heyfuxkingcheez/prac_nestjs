import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersModel } from "./entities/users.entitiy";
import { QueryRunner, Repository } from "typeorm";
import { UserFollowersModel } from "./entities";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepo: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepo: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.userRepo;
  }

  getUserFollowersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepo;
  }

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

  async followUser(followerId: string, followingId: string, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    const result = await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      following: {
        id: followingId,
      },
    });

    return true;
  }

  async getFollowers(userId: string, includeNotConfirmed: boolean) {
    const where = {
      following: {
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
        following: true,
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
    followingId: string,
    qr?: QueryRunner,
  ): Promise<boolean> {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        following: {
          id: followingId,
        },
      },
      relations: {
        following: true,
        follower: true,
      },
    });

    if (!existing)
      throw new NotFoundException("존재하지 않는 팔로우 요청입니다.");

    await userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    });

    return true;
  }

  async deleteFollow(
    followerId: string,
    followingId: string,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      following: {
        id: followingId,
      },
    });

    return true;
  }

  async incrementFollowerCount(userId: string, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.increment(
      {
        id: userId,
      },
      "followerCount",
      1,
    );
  }

  async decrementFollowerCount(userId: string, qr?: QueryRunner) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.decrement(
      {
        id: userId,
      },
      "followerCount",
      1,
    );
  }
}
