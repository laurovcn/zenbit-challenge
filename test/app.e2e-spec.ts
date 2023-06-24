import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/leases/total-amount (GET)', () => {
    it('should calculate total amount of leases', () => {
      const query = { clientUuid: '8a499817-17e4-4b30-9b2b-7dbaf1cc6d0d' };

      return request(app.getHttpServer())
        .get('/leases/total-amount')
        .query(query)
        .expect(200)
        .expect((response) => {
          expect(response.body);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
