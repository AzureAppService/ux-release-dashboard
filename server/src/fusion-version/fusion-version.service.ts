import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { FusionVersion } from './fusion-version.entity';
import { FusionLocation } from '../graphql.schema';
@Injectable()
export class FusionVersionService {
  constructor(private readonly connection: Connection) {}
  async findAll(): Promise<FusionVersion[]> {
    return this.connection.manager.find(FusionVersion);
  }

  async getLocations(): Promise<FusionLocation[]> {
    const c = await this.connection.manager
      .getRepository(FusionVersion)
      .createQueryBuilder('version')
      .select('version.name')
      .addSelect('version.prod')
      .addSelect('version.cloud')
      .groupBy('version.name')
      .addGroupBy('version.prod')
      .addGroupBy('version.cloud')
      .cache(true)
      .getRawMany();

    return c.map(x => ({
      name: x.version_name,
      prod: x.version_prod,
      cloud: x.version_cloud,
      url: '',
    }));
  }

  async getLatestVersion(name: string, cloud: string): Promise<FusionVersion> {
    const item = await this.connection.manager.find(FusionVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      take: 1,
      cache: true,
    });
    return item.length > 0 ? item[0] : null;
  }

  async getVersionHistory(
    name: string,
    cloud: string,
    take = 5,
    skip = +0,
  ): Promise<FusionVersion[]> {
    const items = await this.connection.manager.find(FusionVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      skip,
      take,
      cache: true,
    });
    return items;
  }
}
