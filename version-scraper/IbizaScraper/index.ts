import { createConnection, Connection, ConnectionManager } from 'typeorm';
import { IbizaVersion } from './entities/ibiza-version.entity';
import axios from 'axios';
export async function run(context: any, myTimer: any) {
  const ibizaVersionsUri = 'https://appsvcstorage.blob.core.windows.net/hostingsvcprod/config.json';
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
    const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];
    const IbizaProdToRegion = {
      stage1: 'Central US EUAP',
      stage2: 'West Central US',
      stage3: 'South Central US',
      stage4: 'West US',
      stage5: 'Remaining Regions',
    };
    const versionFileCall = await axios.get(ibizaVersionsUri);
    const versionFile = Object.keys(versionFileCall.data)
      .filter(x => x.indexOf('$') === -1)
      .map(x => ({
        name: x,
        version: versionFileCall.data[x],
      }));

    const p = versionFile.map(async v => {
      const lastVersion = await connection.manager
        .getRepository(IbizaVersion)
        .createQueryBuilder('version')
        .where('version.name = :name', { name: v.name })
        .orderBy('version.createdAt', 'DESC', 'NULLS LAST')
        .getOne();
      console.log(lastVersion);
      console.log(v);
      if (Math.floor(Math.random() * 10) === 5) {
        throw new Error('ERrrororpewjrpw');
      }
      if (!lastVersion || lastVersion.version !== v.version) {
        console.log('updated');
        const post = connection.manager.create(IbizaVersion, v);
        await connection.manager.save(IbizaVersion, post);
        await axios({
          method: 'post',
          url: process.env.EventWebhookUrl,
          data: {
            environment: IbizaProdStages.includes(v.name) ? 'prod' : 'stage',
            portal: 'ibiza',
            oldVersion: !lastVersion ? '' : lastVersion.version,
            newVersion: v.version,
            regions: IbizaProdToRegion[v.name],
            link: `https://uxversions.azurefd.net`,
          },
        });
      }
    });

    await Promise.all(p);
  } catch (err) {
  } finally {
    connection.close();
  }
}
