export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
  tags?: string[];
}

export type UpdatePostInput = Partial<Omit<CreatePostInput, 'author'>>;

export interface ListPostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
