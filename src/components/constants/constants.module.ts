import { Module } from '@nestjs/common';
import { ConstantsService } from './constants.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ConstantsService],
  exports: [ConstantsService],
})
export class ConstantsModule {}
