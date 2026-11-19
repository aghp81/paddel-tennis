import { BadRequestException, Body, ConflictException, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from './prisma.service';

const IRAN_OFFSET = '+03:30';
const minute = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
const localDate = (date: string, time: string) => new Date(`${date}T${time}:00${IRAN_OFFSET}`);
const activeStatuses = [BookingStatus.CONFIRMED, BookingStatus.PENDING];

@Controller('courts')
export class CourtAvailabilityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':courtId/availability')
  async availability(@Param('courtId') id: string, @Query('date') date: string) {
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw new BadRequestException('date و courtId معتبر لازم است');
    const day = localDate(date, '00:00');
    if (Number.isNaN(day.getTime())) throw new BadRequestException('تاریخ معتبر نیست');
    const weekday = new Date(day.getTime() + 210 * 60_000).getUTCDay();
    const court = await this.prisma.court.findUnique({ where: { id }, include: { schedules: { where: { weekday, active: true } } } });
    if (!court?.active) throw new NotFoundException('زمین پیدا نشد');
    const start = day;
    const end = new Date(day.getTime() + 24 * 60 * 60_000);
    const [bookings, closures] = await Promise.all([
      this.prisma.booking.findMany({ where: { courtId: id, startsAt: { lt: end }, endsAt: { gt: start }, OR: [{ status: BookingStatus.CONFIRMED }, { status: BookingStatus.PENDING, OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }] }] }, select: { startsAt: true, endsAt: true } }),
      this.prisma.courtClosure.findMany({ where: { courtId: id, startsAt: { lt: end }, endsAt: { gt: start } }, select: { startsAt: true, endsAt: true } }),
    ]);
    const slots: { startsAt: string; endsAt: string; price: number }[] = [];
    for (const schedule of court.schedules) {
      const duration = schedule.slotDurationMinutes;
      for (let cursor = minute(schedule.opensAt); cursor + duration <= minute(schedule.closesAt); cursor += duration + schedule.bufferMinutes) {
        const startsAt = localDate(date, `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`);
        const endsAt = new Date(startsAt.getTime() + duration * 60_000);
        const collision = [...bookings, ...closures].some((item) => item.startsAt < endsAt && item.endsAt > startsAt);
        if (!collision && startsAt > new Date()) slots.push({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), price: Math.round(court.pricePerHour * duration / 60) });
      }
    }
    return slots;
  }
}

@Controller('bookings')
export class BookingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() body: { courtId: string; startsAt: string; name: string; phone: string }) {
    if (!body?.courtId || !body.name?.trim() || !/^\+?[0-9\s-]{8,16}$/.test(body.phone ?? '') || Number.isNaN(Date.parse(body.startsAt))) {
      throw new BadRequestException('اطلاعات رزرو کامل و معتبر نیست');
    }
    const startsAt = new Date(body.startsAt);
    if (startsAt <= new Date() || startsAt.getUTCSeconds() !== 0 || startsAt.getUTCMilliseconds() !== 0) throw new BadRequestException('زمان شروع باید یک سانس آینده باشد');
    const court = await this.prisma.court.findUnique({ where: { id: body.courtId }, include: { schedules: { where: { active: true } } } });
    if (!court?.active) throw new NotFoundException('زمین پیدا نشد');
    const schedule = court.schedules.find((item) => {
      const day = new Date(startsAt.getTime() + 210 * 60_000).getUTCDay();
      const hm = `${String(new Date(startsAt.getTime() + 210 * 60_000).getUTCHours()).padStart(2, '0')}:${String(new Date(startsAt.getTime() + 210 * 60_000).getUTCMinutes()).padStart(2, '0')}`;
      return item.weekday === day && minute(hm) >= minute(item.opensAt) && minute(hm) + item.slotDurationMinutes <= minute(item.closesAt) && (minute(hm) - minute(item.opensAt)) % (item.slotDurationMinutes + item.bufferMinutes) === 0;
    });
    if (!schedule) throw new BadRequestException('زمان انتخاب‌شده خارج از برنامهٔ زمین است');
    const endsAt = new Date(startsAt.getTime() + schedule.slotDurationMinutes * 60_000);
    const totalPrice = Math.round(court.pricePerHour * schedule.slotDurationMinutes / 60);
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${body.courtId}, 0))`;
        const now = new Date();
        await tx.booking.updateMany({ where: { courtId: body.courtId, status: BookingStatus.PENDING, holdExpiresAt: { lte: now } }, data: { status: BookingStatus.EXPIRED } });
        const conflict = await tx.booking.findFirst({ where: { courtId: body.courtId, status: { in: activeStatuses }, OR: [{ status: BookingStatus.CONFIRMED }, { holdExpiresAt: { gt: now } }, { holdExpiresAt: null }], startsAt: { lt: endsAt }, endsAt: { gt: startsAt } } });
        const closure = await tx.courtClosure.findFirst({ where: { courtId: body.courtId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } } });
        if (conflict || closure) throw new ConflictException('این سانس دیگر آزاد نیست');
        return tx.booking.create({ data: { courtId: body.courtId, startsAt, endsAt, totalPrice, customerName: body.name.trim(), customerPhone: body.phone.replace(/[\s-]/g, ''), holdExpiresAt: new Date(now.getTime() + 10 * 60_000) } });
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw error;
    }
  }
}
