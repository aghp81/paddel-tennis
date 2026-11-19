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
    await prisma.club.upsert({ where: { slug: club.slug }, update: { ...club }, create: { ...club, courts: { create: { name: court, sport, surface, pricePerHour: price, schedules: { create: Array.from({ length: 7 }, (_, weekday) => ({ weekday, opensAt: '08:00', closesAt: '22:00', slotDurationMinutes: 60, bufferMinutes: 0 })) } } } } });
    const savedClub = await prisma.club.findUniqueOrThrow({ where: { slug: club.slug } });
    const savedCourt = await prisma.court.findFirstOrThrow({ where: { clubId: savedClub.id, sport } });
    for (let weekday = 0; weekday < 7; weekday++) {
      const scheduleId = `seed-${club.slug}-${weekday}`;
      await prisma.courtSchedule.upsert({ where: { id: scheduleId }, update: {}, create: { id: scheduleId, courtId: savedCourt.id, weekday, opensAt: '08:00', closesAt: '22:00', slotDurationMinutes: 60 } });
    }
  }
}

main().finally(() => prisma.$disconnect());
