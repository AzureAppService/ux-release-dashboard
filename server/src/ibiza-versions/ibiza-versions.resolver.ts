import { Query, Resolver, ResolveProperty, Parent, Args } from '@nestjs/graphql';
import { IbizaVersionsService } from './ibiza-versions.service';
import { Stage } from 'src/graphql.schema';

@Resolver('Stage')
export class IbizaResolvers {
  constructor(private readonly ibizaService: IbizaVersionsService) {}

  @Query()
  async ibizaStages() {
    return await this.ibizaService.getIbizaStages();
  }

  @Query()
  async getIbizaStage(@Args('name') name: string) {
    return {name};
  }

  @ResolveProperty()
  async latestVersion(@Parent() fusionLocation: Stage) {
    const { name } = fusionLocation;
    const item = await this.ibizaService.getLatestVersion(name);
    return item;
  }

  @ResolveProperty()
  async versionHistory(@Parent() fusionLocation: Stage) {
    const { name } = fusionLocation;
    const items = await this.ibizaService.getVersionHistory(name);
    return items;
  }
}
