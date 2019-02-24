import { Query, Resolver, ResolveProperty, Parent, Args } from '@nestjs/graphql';
import { IbizaVersionsService } from './ibiza-versions.service';
import { Stage } from '../graphql.schema';

@Resolver('Stage')
export class IbizaResolvers {
  constructor(private readonly ibizaService: IbizaVersionsService) {}

  @Query()
  async ibizaStages() {
    return await this.ibizaService.getIbizaStages();
  }

  @Query()
  async getIbizaStage(@Args('name') name: string, @Args('cloud') cloud: string) {
    return {name, cloud};
  }

  @ResolveProperty()
  async latestVersion(@Parent() ibizaStage: Stage) {
    const { name, cloud } = ibizaStage;
    const item = await this.ibizaService.getLatestVersion(name, cloud);
    return item;
  }

  @ResolveProperty()
  async versionHistory(@Parent() ibizaStage: Stage) {
    const { name, cloud } = ibizaStage;
    const items = await this.ibizaService.getVersionHistory(name, cloud);
    return items;
  }
}
