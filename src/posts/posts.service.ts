import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepo: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return await this.postsRepo.find();
  }

  async getPostById(id: string): Promise<PostsModel | null> {
    try {
      const post = await this.postsRepo.findOne({ where: { id } });

      if (!post) throw new NotFoundException();

      return post;
    } catch (error) {
      console.log(error);
    }
  }

  async createPost(
    authorId: string,
    dto: CreatePostReqDto,
  ): Promise<PostsModel> {
    try {
      const post = this.postsRepo.create({
        author: {
          id: authorId,
        },
        ...dto,
        likeCount: 0,
        commentCount: 0,
      });

      const newPost = await this.postsRepo.save(post);

      return newPost;
    } catch (error) {
      console.log(error);
    }
  }

  async updatePost(id: string, dto: UpdatePostReqDto) {
    const post = await this.postsRepo.findOne({
      where: {
        id,
      },
    });

    if (!post) throw new NotFoundException();
    if (dto.title) post.title = dto.title;
    if (dto.content) post.content = dto.content;

    const updatedPost = await this.postsRepo.save(post);

    return updatedPost;
  }

  async deletePost(postId: string) {
    const post = await this.postsRepo.findOne({
      where: {
        id: postId,
      },
    });
    console.log(post);

    if (!post) throw new NotFoundException();

    return await this.postsRepo.delete(postId);
  }
}
