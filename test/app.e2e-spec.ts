import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { setBaseUrl } from 'pactum/src/exports/request';
import { EditUserDto } from 'src/user/dto/edit-user.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    // await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    await setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto = {
      email: 'nirmal@gmail.com',
      passcode: '112234',
    };
    describe('SignUp', () => {
      it('signUp should pass', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw error when email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            passcode: dto.passcode,
          })
          .expectStatus(400);
      });

      it('should throw error when passcode is empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error when there is no detail', () => {
        return pactum.spec().post('/auth/signUp').expectStatus(400);
      });
    });

    describe('SignIn', () => {
      it('signIn should pass', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('should throw error when email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            passcode: dto.passcode,
          })
          .expectStatus(400);
      });

      it('should throw error when passcode is empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error when there is no detail', () => {
        return pactum.spec().post('/auth/signUp').expectStatus(400);
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit the user', () => {
        const dto: EditUserDto = {
          firstName: 'Nirmal',
          email: 'nirmal@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
        // .expectBodyContains(dto.firstName)
        // .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Create Bookmark', () => {});
    describe('Get Bookmark', () => {});
    describe('Get Bookmark By Id', () => {});
    describe('Edit Bookmark By Id', () => {});
    describe('Delete Bookmark By Id', () => {});
  });
});
