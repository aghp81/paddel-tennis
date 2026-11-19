import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('courts')
export class CourtsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('club/:slug')
  async club(@Param('slug') slug: string) {
    const club = await this.prisma.club.findUnique({ where: { slug }, include: { courts: { where: { active: true } } } });
    if (!club || !club.active) throw new NotFoundException('باشگاه پیدا نشد');
    return club;
  }

  @Get()
  async list(@Query('city') city?: string, @Query('sport') sport?: string) {
    return this.prisma.court.findMany({
      where: { active: true, ...(sport ? { sport: sport as 'TENNIS' | 'PADEL' } : {}), ...(city ? { club: { city } } : {}) },
      include: { club: true }, orderBy: { club: { rating: 'desc' } },
    }).then((courts) => courts.map((court) => ({ id: court.id, slug: court.club.slug, name: court.club.name, courtName: court.name, city: court.club.city, district: court.club.district ?? '', sport: court.sport, surface: court.name, rating: court.club.rating, price: court.pricePerHour, nextSlot: '' })));
  }
}
