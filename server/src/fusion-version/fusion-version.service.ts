import { Injectable, OnModuleInit } from '@nestjs/common';
import { Connection } from 'typeorm';
import { FusionVersion } from './fusion-version.entity';
import { FusionLocation } from '../graphql.schema';
@Injectable()
export class FusionVersionService implements OnModuleInit {
  private locations: FusionLocation[] = [];
  private latestVersion: { [key: string]: FusionVersion };
  private versionHistory: { [key: string]: FusionVersion[] };
  constructor(private readonly connection: Connection) {}

  async onModuleInit() {
    this.updateData();
    setInterval(() => {
      this.updateData();
    }, 10000);
  }
  private async updateData() {
    this.locations = await this.getLocationsQuery();
    const promises = this.locations.map(({ name, cloud }) => {
      return this.getLatestVersionQuery(name, cloud).then(x => ({
        name,
        cloud,
        value: x,
      }));
    });
    const values = await Promise.all(promises);
    this.latestVersion = values.reduce((acc, val) => {
      acc[`${val.name}-${val.cloud}`] = val.value;
      return acc;
    }, {});

    const historyPromises = this.locations.map(({ name, cloud }) => {
      return this.getVersionHistoryQuery(name, cloud).then(x => ({
        name,
        cloud,
        value: x,
      }));
    });
    const historyValues = await Promise.all(historyPromises);
    this.versionHistory = historyValues.reduce((acc, val) => {
      acc[`${val.name}-${val.cloud}`] = val.value;
      return acc;
    }, {});
  }

  async getVersionHistoryQuery(
    name: string,
    cloud: string,
  ): Promise<FusionVersion[]> {
    const items = await this.connection.manager.find(FusionVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      take: 20,
      cache: true,
    });
    return items;
  }
  async getLatestVersionQuery(
    name: string,
    cloud: string,
  ): Promise<FusionVersion> {
    const item = await this.connection.manager.find(FusionVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      take: 1,
      cache: true,
    });
    return item.length > 0 ? item[0] : null;
  }
  async getLocationsQuery(): Promise<FusionLocation[]> {
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

  getLocations(): FusionLocation[] {
    return this.locations;
  }

  getLatestVersion(name: string, cloud: string): FusionVersion {
    return this.latestVersion && this.latestVersion[`${name}-${cloud}`];
  }
  getVersionHistory(name: string, cloud: string): FusionVersion[] {
    return this.versionHistory && this.versionHistory[`${name}-${cloud}`];
  }
}
