import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { FusionVersion } from './fusion-version.entity';
import { FusionLocation } from 'src/graphql.schema';
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
      .groupBy('version.name')
      .addGroupBy('version.prod')
      .getRawMany();

    return c.map(x => ({
      name: x.version_name,
      prod: x.version_prod,
      url: '',
    }));
  }

  async getLatestVersion(name: string): Promise<FusionVersion> {
    const item = await this.connection.manager.find(FusionVersion, {
      where: { name },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return item.length > 0 ? item[0] : null;
  }

  async getVersionHistory(name: string): Promise<FusionVersion[]> {
    const items = await this.connection.manager.find(FusionVersion, {
      where: { name },
      order: { createdAt: 'DESC' },
    });
    return items;
  }
}
