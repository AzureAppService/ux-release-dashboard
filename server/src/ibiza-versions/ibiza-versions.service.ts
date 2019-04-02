import { Injectable, OnModuleInit } from '@nestjs/common';
import { IbizaVersion } from './ibiza-version.entity';
import { Connection } from 'typeorm';
import { Stage } from '../graphql.schema';
import { timer, interval } from 'rxjs';

@Injectable()
export class IbizaVersionsService implements OnModuleInit {
  private ibizaStages: any[];
  private latestVersion: { [key: string]: IbizaVersion };
  private VersionHistory: { [key: string]: IbizaVersion[] };
  constructor(private readonly connection: Connection) {
    this.updateData.bind(this);
  }
  async onModuleInit() {
    await this.updateData();

    setInterval(() => {
      this.updateData();
    }, 10000);
  }

  private async updateData() {
    this.ibizaStages = await this.getIbizaStagesQuery();
    const stages = this.getIbizaStages();
    const promises = stages.map(({ name, cloud }) => {
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

    const historyPromises = stages.map(({ name, cloud }) => {
      return this.getVersionHistoryQuery(name, cloud).then(x => ({
        name,
        cloud,
        value: x,
      }));
    });
    const historyValues = await Promise.all(historyPromises);
    this.VersionHistory = historyValues.reduce((acc, val) => {
      acc[`${val.name}-${val.cloud}`] = val.value;
      return acc;
    }, {});
  }
  private async getVersionHistoryQuery(
    name: string,
    cloud: string,
  ): Promise<IbizaVersion[]> {
    const items = await this.connection.manager.find(IbizaVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      cache: true,
    });
    return items;
  }
  private async getIbizaStagesQuery(): Promise<any[]> {
    return await this.connection.manager
      .getRepository(IbizaVersion)
      .createQueryBuilder('version')
      .select('version.name')
      .addSelect('version.cloud')
      .groupBy('version.name')
      .addGroupBy('version.cloud')
      .cache(true)
      .getRawMany();
  }
  private async getLatestVersionQuery(
    name: string,
    cloud: string,
  ): Promise<IbizaVersion> {
    const item = await this.connection.manager.find(IbizaVersion, {
      where: { name, cloud },
      order: { createdAt: 'DESC' },
      take: 1,
      cache: true,
    });
    return item.length > 0 ? item[0] : null;
  }

  getIbizaStages(): Stage[] {
    return this.ibizaStages.map(x => ({
      name: x.version_name,
      cloud: x.version_cloud,
    }));
  }

  getLatestVersion(name: string, cloud: string): IbizaVersion {
    return this.latestVersion && this.latestVersion[`${name}-${cloud}`];
  }

  getVersionHistory(name: string, cloud: string): IbizaVersion[] {
    return this.VersionHistory && this.VersionHistory[`${name}-${cloud}`];
  }
}
