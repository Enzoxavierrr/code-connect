import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Posts (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('runs the full CRUD + like flow', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/posts')
      .send({ title: 'Ola', content: 'mundo', author: 'enzo', tags: ['Intro'] })
      .expect(201);
    const id = created.body.id as string;
    expect(created.body.tags).toEqual(['intro']);

    await request(server).get(`/posts/${id}`).expect(200);

    const list = await request(server).get('/posts?tag=intro').expect(200);
    expect(list.body.meta.total).toBe(1);

    const patched = await request(server)
      .patch(`/posts/${id}`)
      .send({ title: 'Ola 2' })
      .expect(200);
    expect(patched.body.title).toBe('Ola 2');

    const liked = await request(server).post(`/posts/${id}/like`).expect(200);
    expect(liked.body.likes).toBe(1);

    await request(server).delete(`/posts/${id}`).expect(204);
    await request(server).get(`/posts/${id}`).expect(404);
  });

  it('returns 400 for invalid input and ids', async () => {
    const server = app.getHttpServer();
    const res = await request(server).post('/posts').send({}).expect(400);
    expect(res.body.message).toContain('title must be a non-empty string');
    await request(server).get('/posts/not-a-uuid').expect(400);
    await request(server).get('/posts?limit=999').expect(400);
  });
});
