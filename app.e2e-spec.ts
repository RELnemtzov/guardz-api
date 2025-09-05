import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import './matchers/urlEntityMatchers';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const srcIp1 = '100.99.98.97';
  const srcIp2 = '1.2.3.4';

  it('GET /urls should return [] the first time', async () => {
    const res = await request(app.getHttpServer())
      .get('/urls')
      .set('X-Forwarded-For', srcIp1); // For @Ip
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /urls then GET should return submitted URLs', async () => {
    const batch1 = ['http://blabla1.com', 'http://blabla2.com'];
    const batch2 = ['http://bob.loblaw-law.blog'];
    const batch3 = ['http://example.com'];

    // Submit for srcIp1
    await request(app.getHttpServer())
      .post('/urls')
      .set('X-Forwarded-For', srcIp1)
      .send({ urls: batch1 })
      .expect(201); // Nest default for POST

    // Submit for srcIp2
    await request(app.getHttpServer())
      .post('/urls')
      .set('X-Forwarded-For', srcIp2)
      .send({ urls: batch2 })
      .expect(201);

    // Submit again for srcIp1
    await request(app.getHttpServer())
      .post('/urls')
      .set('X-Forwarded-For', srcIp1)
      .send({ urls: batch3 })
      .expect(201); // Nest default for POST

    // Get srcIp1
    const res1 = await request(app.getHttpServer())
      .get('/urls')
      .set('X-Forwarded-For', srcIp1);
    expect(res1.status).toBe(200);
    expect(res1.body).toMatchUrlsIgnoringOrder([...batch1, ...batch3]);

    // Get srcIp2
    const res2 = await request(app.getHttpServer())
      .get('/urls')
      .set('X-Forwarded-For', srcIp2);
    expect(res2.status).toBe(200);
    expect(res2.body).toMatchUrlsIgnoringOrder(batch2);
  });
});
