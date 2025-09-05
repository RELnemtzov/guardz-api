import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import '../test/matchers/urlEntityMatchers';
import type { Request } from 'express';
import { AppRepository } from './app.repository';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, AppRepository],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  const srcIp1 = '100.99.98.97';
  const srcIp2 = '1.2.3.4';

  const testBatch1 = ['http://blabla1.com', 'http://blabla2.com'];
  const testBatch2 = ['http://bob.loblaw-law.blog'];
  const testBatch3 = ['http://example.com'];

  const makeReq = (ip?: string): Partial<Request> => ({
    headers: ip ? { 'x-forwarded-for': ip } : {},
  });

  describe('get first', () => {
    it('should return empty first time', async () => {
      const result = await appController.getURLs(
        makeReq(srcIp1) as Request,
        srcIp1,
      );
      expect(result).toEqual([]);
    });
  });

  describe('Post URLs and get them', () => {
    it('should update existing urls for srcIp1', async () => {
      await expect(
        appController.submitURLs(makeReq(srcIp1) as Request, srcIp1, {
          urls: testBatch1,
        }),
      ).resolves.toBeUndefined();
      await expect(
        appController.submitURLs(makeReq(srcIp2) as Request, srcIp2, {
          urls: testBatch2,
        }),
      ).resolves.toBeUndefined();
      await expect(
        appController.submitURLs(makeReq(srcIp1) as Request, srcIp1, {
          urls: testBatch3,
        }),
      ).resolves.toBeUndefined();
      const res1 = await appController.getURLs(
        makeReq(srcIp1) as Request,
        srcIp1,
      );
      expect(res1).toMatchUrlsIgnoringOrder([...testBatch1, ...testBatch3]);
      const res2 = await appController.getURLs(
        makeReq(srcIp2) as Request,
        srcIp2,
      );
      expect(res2).toMatchUrlsIgnoringOrder(testBatch2);
    });
  });
});
