import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    console.log('Get Bookmarks Console');

    return await this.prisma.bookMark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    return await this.prisma.bookMark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookMarkDto) {
    const bookMark = await this.prisma.bookMark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookMark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookMarkDto,
  ) {
    const bookMark = await this.prisma.bookMark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookMark || bookMark.userId !== userId)
      throw new ForbiddenException('Access to resource denied');
    return this.prisma.bookMark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookMark = await this.prisma.bookMark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookMark || bookMark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prisma.bookMark.delete({
      where: {
        id: bookmarkId,
      },
    });
    return 'Bookmark Deleted';
  }
}
