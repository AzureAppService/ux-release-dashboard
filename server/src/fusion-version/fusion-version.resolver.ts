import {
  Query,
  Resolver,
  ResolveProperty,
  Parent,
  Args,
} from '@nestjs/graphql';
import { FusionVersionService } from './fusion-version.service';
import { FusionLocation } from '../graphql.schema';

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
    const { name, cloud } = fusionLocation;
    const item = await this.fusionService.getLatestVersion(name, cloud);
    return item;
  }

  @ResolveProperty()
  async versionHistory(@Parent() fusionLocation: FusionLocation, @Args('take') take?: number, @Args('skip') skip?: number) {
    const { name, cloud } = fusionLocation;
    const items = await this.fusionService.getVersionHistory(name,  cloud, 20, 0);
    return items;
  }
}
