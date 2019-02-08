import { createConnection, Connection, ConnectionManager } from 'typeorm';
import { IbizaVersion } from './entities/ibiza-version.entity';
import axios from 'axios';

const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];
const IbizaProdToRegion = {
  stage1: 'Central US EUAP',
  stage2: 'West Central US',
  stage3: 'South Central US',
  stage4: 'West US',
  stage5: 'Remaining Regions',
};

const IbizaMooncakeToRegion = {
  stage1: 'Central US EUAP',
  stage2: 'Remaining Moonake Regions',
};

const IbizaFairfaxToRegion = {
  stage1: 'Central US EUAP',
  stage2: 'Remaining Fairfax Regions',
};

const IbizaBlackforestToRegion = {
  stage1: 'Central US EUAP',
  stage2: 'Remaining Blackforest Regions',
};

const processVersions = async (connection: Connection, regionMap: { [key: string]: string }, cloud: string, versionFileCall: any) => {
  const versionFile = Object.keys(versionFileCall.data)
    .filter(x => x.indexOf('$') === -1)
    .map(x => ({
      name: x,
      version: versionFileCall.data[x],
      cloud,
    }));

  const p = versionFile.map(async v => {
    const lastVersion = await connection.manager
      .getRepository(IbizaVersion)
      .createQueryBuilder('version')
      .where('version.name = :name and version.cloud = :cloud', { name: v.name, cloud })
      .orderBy('version.createdAt', 'DESC', 'NULLS LAST')
      .getOne();
    if (!lastVersion || lastVersion.version !== v.version) {
      const post = connection.manager.create(IbizaVersion, v);
      await connection.manager.save(IbizaVersion, post);
      if (cloud === 'public') {
        await axios({
          method: 'post',
          url: process.env.EventWebhookUrl,
          data: {
            environment: IbizaProdStages.includes(v.name) ? 'prod' : 'stage',
            portal: 'ibiza',
            oldVersion: !lastVersion ? '' : lastVersion.version,
            newVersion: v.version,
            regions: regionMap[v.name],
            link: `https://uxversions.azurefd.net`,
          },
        });
      }
    }
  });

  await Promise.all(p);
};
export async function run(context: any, myTimer: any) {
  const ibizaVersionsUri = 'https://appsvcstorage.blob.core.windows.net/hostingsvcprod/config.json';
  const ibizaVersionUriMooncake = 'https://appsvchostingsvc.blob.core.chinacloudapi.cn/appsvchostingsvc/config.json';
  const ibizaVersionUriFairfax = 'https://appsvchostingsvc.blob.core.usgovcloudapi.net/appsvchostingsvc/config.json';
  const ibizaVersionUriBlackforest = 'https://appsvchostingsvc.blob.core.cloudapi.de/appsvchostingsvc/config.json';
  const connection: Connection = await createConnection({
    type: 'postgres',
    host: process.env.POSTGRES_ENDPOINT,
    port: 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: true,
    name: 'ibiza',
    entities: [IbizaVersion],
  });
  try {
    let versionFileCall = await axios.get(ibizaVersionsUri);
    await processVersions(connection, IbizaProdToRegion, 'public', versionFileCall);

    versionFileCall = await axios.get(ibizaVersionUriMooncake);
    await processVersions(connection, IbizaMooncakeToRegion, 'mooncake', versionFileCall);

    versionFileCall = await axios.get(ibizaVersionUriBlackforest);
    await processVersions(connection, IbizaBlackforestToRegion, 'blackforest', versionFileCall);

    versionFileCall = await axios.get(ibizaVersionUriFairfax);
    await processVersions(connection, IbizaFairfaxToRegion, 'fairfax', versionFileCall);
  } catch (err) {
  } finally {
    connection.close();
  }
}
