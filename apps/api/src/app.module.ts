import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CourtsController } from './courts.controller';
import { PlayersController } from './players.controller';

@Module({ controllers: [CourtsController, PlayersController], providers: [PrismaService] })
export class AppModule {}
