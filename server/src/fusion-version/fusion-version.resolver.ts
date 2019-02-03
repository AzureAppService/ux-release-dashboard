import {
  Query,
  Resolver,
  ResolveProperty,
  Parent,
  Args,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { FusionVersionService } from './fusion-version.service';
import { FusionLocation } from 'src/graphql.schema';

@Resolver('FusionLocation')
export class FusionLocationResolvers {
  constructor(private readonly fusionService: FusionVersionService) {}
  @Query()
  async fusionLocations() {
    return await this.fusionService.getLocations();
  }

  @Query()
  async getFusionLocation(@Args('location') location: string) {
    const locs = await this.fusionService.getLocations();
    return locs.find(x => x.name === location);
  }

  @ResolveProperty()
  async latestVersion(@Parent() fusionLocation: FusionLocation) {
    const { name } = fusionLocation;
    const item = await this.fusionService.getLatestVersion(name);
    return item;
  }

  @ResolveProperty()
  async versionHistory(@Parent() fusionLocation: FusionLocation) {
    const { name } = fusionLocation;
    const items = await this.fusionService.getVersionHistory(name);
    return items;
  }
}
