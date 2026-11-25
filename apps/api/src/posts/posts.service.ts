import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  CreatePostInput,
  ListPostsQuery,
  Paginated,
  Post,
  UpdatePostInput,
} from './post.entity.js';

const DEFAULT_LIMIT = 10;

@Injectable()
export class PostsService {
  private readonly posts = new Map<string, Post>();

  create(input: CreatePostInput): Post {
    const now = new Date();
    const post: Post = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      author: input.author,
      tags: input.tags ?? [],
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(post.id, post);
    return post;
  }

  findAll(query: ListPostsQuery = {}): Paginated<Post> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const search = query.search?.toLowerCase();

    const filtered = [...this.posts.values()]
      .filter((p) => !query.tag || p.tags.includes(query.tag))
      .filter(
        (p) =>
          !search ||
          p.title.toLowerCase().includes(search) ||
          p.content.toLowerCase().includes(search),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string): Post {
    const post = this.posts.get(id);
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  update(id: string, input: UpdatePostInput): Post {
    const post = this.findOne(id);
    const updated: Post = {
      ...post,
      ...Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined),
      ),
      updatedAt: new Date(),
    };
    this.posts.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.posts.delete(id);
  }

  like(id: string): Post {
    const post = this.findOne(id);
    post.likes += 1;
    return post;
  }
}
