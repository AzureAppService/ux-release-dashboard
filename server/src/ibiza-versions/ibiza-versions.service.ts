import { Injectable } from '@nestjs/common';
import { IbizaVersion } from './ibiza-version.entity';
import { Connection } from 'typeorm';
import { Stage } from 'src/graphql.schema';

@Injectable()
export class IbizaVersionsService {
  constructor(private readonly connection: Connection) {}
  async getIbizaStages(): Promise<Stage[]> {
    const c = await this.connection.manager
    .getRepository(IbizaVersion)
    .createQueryBuilder('version')
    .select('version.name')
    .groupBy('version.name')
    .getRawMany();

    return c.map(x => ({
      name: x.version_name,
    }));
  }

  async getLatestVersion(name: string): Promise<IbizaVersion> {
    const item = await this.connection.manager.find(IbizaVersion, {
      where: { name },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return item.length > 0 ? item[0] : null;
  }

  async getVersionHistory(name: string): Promise<IbizaVersion[]> {
    const items = await this.connection.manager.find(IbizaVersion, {
      where: { name },
      order: { createdAt: 'DESC' },
    });
    return items;
  }

}
