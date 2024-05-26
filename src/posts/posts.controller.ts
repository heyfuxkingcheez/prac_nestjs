import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities';
import { CreatePostReqDto, UpdatePostReqDto } from './dto';

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
  async createPost(@Body() dto: CreatePostReqDto): Promise<PostsModel> {
    return await this.postsService.createPost(dto);
  }

  @Put(':id')
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
