import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities';
import { PostsController } from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
