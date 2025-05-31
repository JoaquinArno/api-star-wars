import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConstantsService,
  LOGGER_SERVICE,
} from '../constants/constants.service';
import { Movie } from './entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { WinstonLogger } from '../../config/logger.config';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MovieController],
  providers: [
    MovieService,
    ConstantsService,
    {
      provide: LOGGER_SERVICE,
      useClass: WinstonLogger,
    },
  ],
})
export class MovieModule {}
