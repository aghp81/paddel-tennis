import { PrismaClient, CourtSurface, Sport } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clubs = [
    { slug: 'olympic-tennis', name: 'باشگاه تنیس المپیک', city: 'تهران', district: 'شهرک غرب', rating: 4.8, court: 'زمین روباز', sport: Sport.TENNIS, surface: CourtSurface.OUTDOOR, price: 350000 },
    { slug: 'aftab-padel', name: 'پدل سنتر آفتاب', city: 'تهران', district: 'سعادت‌آباد', rating: 4.9, court: 'زمین شیشه‌ای', sport: Sport.PADEL, surface: CourtSurface.GLASS, price: 500000 },
    { slug: 'spin-academy', name: 'آکادمی اسپین', city: 'اصفهان', district: 'مرداویج', rating: 4.7, court: 'زمین سرپوشیده', sport: Sport.TENNIS, surface: CourtSurface.INDOOR, price: 300000 },
  ];
  for (const item of clubs) {
    const { court, sport, surface, price, ...club } = item;
    await prisma.club.upsert({ where: { slug: club.slug }, update: { ...club }, create: { ...club, courts: { create: { name: court, sport, surface, pricePerHour: price } } } });
  }
}

main().finally(() => prisma.$disconnect());
