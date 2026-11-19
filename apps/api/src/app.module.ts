import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CourtsController } from './courts.controller';
import { PlayersController } from './players.controller';
import { BookingsController, CourtAvailabilityController } from './bookings.controller';

@Module({ controllers: [CourtsController, PlayersController, CourtAvailabilityController, BookingsController], providers: [PrismaService] })
export class AppModule {}
