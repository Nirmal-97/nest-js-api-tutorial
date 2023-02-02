import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { setBaseUrl } from 'pactum/src/exports/request';
import { EditUserDto } from 'src/user/dto';
import { CreateBookMarkDto, EditBookMarkDto } from 'src/bookmark/dto';

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
          .post('/auth/signIn')
          .withBody({
            passcode: dto.passcode,
          })
          .expectStatus(400);
      });

      it('should throw error when passcode is empty', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error when there is no detail', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
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
        return (
          pactum
            .spec()
            .patch('/users')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .withBody(dto)
            .expectStatus(200)
            // .expectStatus(200)
            .inspect()
            .expectBodyContains(dto.firstName)
            .expectBodyContains(dto.email)
        );
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get Empty Bookmark', () => {
      it('should get book marks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
        // .inspect();
      });
    });

    describe('Create Bookmark', () => {
      const dto: CreateBookMarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&list=WL&index=1&t=11583s',
      };
      it('should creates bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
        // .inspect();
      });
    });

    describe('Get Bookmark', () => {
      it('should get book marks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
        // .expectJsonLength(1);
      });
    });

    describe('Get Bookmark By Id', () => {
      it('should get book marks by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .inspect();
      });
    });

    describe('Edit Bookmark By Id', () => {
      const dto: EditBookMarkDto = {
        title: 'NestJs Course for Beginners - Create a REST API',
        description: 'NestJs Course for Beginners Create a REST API',
      };
      it('should edit book marks by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete Bookmark By Id', () => {
      it('should deleyt book mark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
  });
});
