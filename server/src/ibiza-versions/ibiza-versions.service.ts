import { Injectable } from '@nestjs/common';
import { IbizaVersion } from './ibiza-version.entity';
import { Connection } from 'typeorm';
import { Stage } from '../graphql.schema';

@Injectable()
export class IbizaVersionsService {
  constructor(private readonly connection: Connection) {}
  async getIbizaStages(): Promise<Stage[]> {
    const c = await this.connection.manager
    .getRepository(IbizaVersion)
    .createQueryBuilder('version')
    .select('version.name')
    .addSelect('version.cloud')
    .groupBy('version.name')
    .addGroupBy('version.cloud')
    .getRawMany();

    return c.map(x => ({
      name: x.version_name,
      cloud: x.version_cloud,
    }));
  }

  async getLatestVersion(name: string, cloud: string): Promise<IbizaVersion> {
    const item = await this.connection.manager.find(IbizaVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return item.length > 0 ? item[0] : null;
  }

  async getVersionHistory(name: string, cloud: string, take= 5, skip = 0): Promise<IbizaVersion[]> {
    const items = await this.connection.manager.find(IbizaVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return items;
  }

}
