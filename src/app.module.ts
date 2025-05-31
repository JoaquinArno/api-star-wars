import { Module } from '@nestjs/common';
import { ConstantsModule } from './components/constants/constants.module';
import { ConstantsService } from './components/constants/constants.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './components/auth/auth.module';
import { UserModule } from './components/user/user.module';
import { MovieModule } from './components/movie/movie.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConstantsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConstantsModule],
      inject: [ConstantsService],
      useFactory: (constantsService: ConstantsService) =>
        constantsService.typeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    MovieModule,
  ],
})
export class AppModule {}
