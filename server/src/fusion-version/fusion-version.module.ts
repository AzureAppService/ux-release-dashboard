import { Module } from '@nestjs/common';
import { FusionVersionService } from './fusion-version.service';
import { FusionLocationResolvers } from './fusion-version.resolver';
@Module({
  providers: [FusionVersionService, FusionLocationResolvers],
})
export class FusionVersionModule {}
