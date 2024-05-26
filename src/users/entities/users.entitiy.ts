import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './../../common/base.entity';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities';

@Entity()
export class UsersModel extends BaseEntity {
  @Column({ length: 20, unique: true, nullable: false })
  nickname: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
