import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('city') city?: string, @Query('sport') sport?: string) {
    return this.prisma.playerProfile.findMany({
      where: { ...(city ? { city } : {}), ...(sport ? { sports: { has: sport as 'TENNIS' | 'PADEL' } } : {}) },
      include: { user: { select: { id: true, displayName: true, city: true, avatarUrl: true } } },
      orderBy: { rating: 'desc' }, take: 30,
    });
  }
}
