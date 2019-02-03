import { Module } from '@nestjs/common';
import { IbizaVersionsService } from './ibiza-versions.service';
import { IbizaResolvers } from './ibiza-versions.resolver';

@Module({
  providers: [IbizaVersionsService, IbizaResolvers],
})
export class IbizaVersionsModule {}
