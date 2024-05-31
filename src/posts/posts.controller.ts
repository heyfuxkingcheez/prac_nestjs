import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  async getPostById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async createPost(
    @Body() dto: CreatePostReqDto,
    @User('id') userId: string,
  ): Promise<PostsModel> {
    return await this.postsService.createPost(userId, dto);
  }

  @Patch(':id')
  async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostReqDto,
  ): Promise<PostsModel> {
    return await this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseUUIDPipe) id: string) {
    return await this.postsService.deletePost(id);
  }
}
