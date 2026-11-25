import { BadRequestException } from '@nestjs/common';
import {
  parseCreatePost,
  parseListQuery,
  parseUpdatePost,
} from './posts.validation.js';

describe('posts validation', () => {
  it('normalizes a valid create body', () => {
    expect(
      parseCreatePost({
        title: '  Oi  ',
        content: 'texto',
        author: 'enzo',
        tags: ['React', 'react', ' '],
      }),
    ).toEqual({
      title: 'Oi',
      content: 'texto',
      author: 'enzo',
      tags: ['react'],
    });
  });

  it('collects all create errors', () => {
    try {
      parseCreatePost({ title: '', tags: 'x' });
      expect.fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const res = (e as BadRequestException).getResponse() as {
        message: string[];
      };
      expect(res.message).toEqual([
        'title must be a non-empty string',
        'content must be a non-empty string',
        'author must be a non-empty string',
        'tags must be an array of strings',
      ]);
    }
  });

  it('rejects empty or author-changing updates', () => {
    expect(() => parseUpdatePost({})).toThrow(BadRequestException);
    expect(() => parseUpdatePost({ author: 'x', title: 'y' })).toThrow(
      BadRequestException,
    );
    expect(parseUpdatePost({ title: 'novo' })).toEqual({ title: 'novo' });
  });

  it('parses list query', () => {
    expect(parseListQuery({ page: '2', limit: '5', tag: 'React' })).toEqual({
      page: 2,
      limit: 5,
      search: undefined,
      tag: 'react',
    });
    expect(() => parseListQuery({ page: '0' })).toThrow(BadRequestException);
    expect(() => parseListQuery({ limit: '500' })).toThrow(BadRequestException);
  });
});
