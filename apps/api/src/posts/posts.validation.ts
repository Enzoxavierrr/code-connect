import { BadRequestException } from '@nestjs/common';
import type {
  CreatePostInput,
  ListPostsQuery,
  UpdatePostInput,
} from './post.entity.js';

const TITLE_MAX = 120;
const CONTENT_MAX = 5000;
const TAGS_MAX = 10;
export const LIMIT_MAX = 50;

type Errors = string[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkString(
  errors: Errors,
  field: string,
  value: unknown,
  max: number,
): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} must be a non-empty string`);
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    errors.push(`${field} must have at most ${max} characters`);
  }
  return trimmed;
}

function checkTags(errors: Errors, value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((t) => typeof t !== 'string')) {
    errors.push('tags must be an array of strings');
    return undefined;
  }
  const tags = [
    ...new Set(
      (value as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean),
    ),
  ];
  if (tags.length > TAGS_MAX) {
    errors.push(`tags must have at most ${TAGS_MAX} items`);
  }
  return tags;
}

function fail(errors: Errors): never {
  throw new BadRequestException({ message: errors, error: 'Bad Request' });
}

export function parseCreatePost(body: unknown): CreatePostInput {
  if (!isRecord(body)) fail(['body must be a JSON object']);
  const errors: Errors = [];
  const title = checkString(errors, 'title', body.title, TITLE_MAX);
  const content = checkString(errors, 'content', body.content, CONTENT_MAX);
  const author = checkString(errors, 'author', body.author, 60);
  const tags = body.tags === undefined ? [] : checkTags(errors, body.tags);
  if (errors.length) fail(errors);
  return { title: title!, content: content!, author: author!, tags };
}

export function parseUpdatePost(body: unknown): UpdatePostInput {
  if (!isRecord(body)) fail(['body must be a JSON object']);
  const errors: Errors = [];
  const out: UpdatePostInput = {};
  if ('author' in body) errors.push('author cannot be changed');
  if (body.title !== undefined)
    out.title = checkString(errors, 'title', body.title, TITLE_MAX);
  if (body.content !== undefined)
    out.content = checkString(errors, 'content', body.content, CONTENT_MAX);
  if (body.tags !== undefined) out.tags = checkTags(errors, body.tags);
  if (!errors.length && Object.keys(out).length === 0)
    errors.push('at least one of title, content or tags must be provided');
  if (errors.length) fail(errors);
  return out;
}

function toPositiveInt(
  errors: Errors,
  field: string,
  raw: unknown,
): number | undefined {
  if (raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    errors.push(`${field} must be a positive integer`);
    return undefined;
  }
  return n;
}

export function parseListQuery(query: Record<string, unknown>): ListPostsQuery {
  const errors: Errors = [];
  const page = toPositiveInt(errors, 'page', query.page);
  const limit = toPositiveInt(errors, 'limit', query.limit);
  if (limit !== undefined && limit > LIMIT_MAX)
    errors.push(`limit must be at most ${LIMIT_MAX}`);
  if (errors.length) fail(errors);
  const search =
    typeof query.search === 'string' && query.search.trim()
      ? query.search.trim()
      : undefined;
  const tag =
    typeof query.tag === 'string' && query.tag.trim()
      ? query.tag.trim().toLowerCase()
      : undefined;
  return { page, limit, search, tag };
}
