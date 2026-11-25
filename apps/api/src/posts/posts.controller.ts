import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import {
  parseCreatePost,
  parseListQuery,
  parseUpdatePost,
} from './posts.validation.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.postsService.create(parseCreatePost(body));
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.postsService.findAll(parseListQuery(query));
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: unknown) {
    return this.postsService.update(id, parseUpdatePost(body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.postsService.remove(id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  like(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.like(id);
  }
}
