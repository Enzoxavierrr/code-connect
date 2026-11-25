import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service.js';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new PostsService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const make = (title: string, tags: string[] = []) => {
    const post = service.create({
      title,
      content: `conteudo de ${title}`,
      author: 'enzo',
      tags,
    });
    vi.advanceTimersByTime(1000);
    return post;
  };

  it('creates a post with defaults', () => {
    const post = make('Primeiro');
    expect(post).toMatchObject({ title: 'Primeiro', likes: 0, tags: [] });
    expect(post.id).toBeTypeOf('string');
  });

  it('lists newest first with pagination meta', () => {
    make('A');
    make('B');
    make('C');
    const result = service.findAll({ page: 1, limit: 2 });
    expect(result.data.map((p) => p.title)).toEqual(['C', 'B']);
    expect(result.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
    expect(
      service.findAll({ page: 2, limit: 2 }).data.map((p) => p.title),
    ).toEqual(['A']);
  });

  it('filters by search (title or content) and tag', () => {
    make('React hooks', ['react']);
    make('Nest modules', ['nestjs']);
    expect(service.findAll({ search: 'HOOKS' }).data).toHaveLength(1);
    expect(service.findAll({ search: 'conteudo' }).data).toHaveLength(2);
    expect(service.findAll({ tag: 'nestjs' }).data[0].title).toBe(
      'Nest modules',
    );
  });

  it('updates only provided fields and bumps updatedAt', () => {
    const post = make('Old');
    const updated = service.update(post.id, { title: 'New' });
    expect(updated.title).toBe('New');
    expect(updated.content).toBe(post.content);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      post.createdAt.getTime(),
    );
  });

  it('likes and removes', () => {
    const post = make('X');
    service.like(post.id);
    expect(service.like(post.id).likes).toBe(2);
    service.remove(post.id);
    expect(() => service.findOne(post.id)).toThrow(NotFoundException);
  });
});
