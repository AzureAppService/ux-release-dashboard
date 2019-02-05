import { createConnection, Connection, ConnectionManager } from 'typeorm';
import { FusionVersion } from './entities/FusionVersion';
import { DevOpsData } from './entities/DevOpsData';
import { GithubCommit } from './entities/GithubCommits';
import axios from 'axios';

const fusionLocations = [
  'db3',
  'hk1',
  'bay',
  'blu',
  'france',
  'india',
  'brazil',
  'australia',
  'db3-staging',
  'hk1-staging',
  'bay-staging',
  'blu-staging',
  'france-staging',
  'india-staging',
  'brazil-staging',
  'australia-staging',
];
const functionObjs = fusionLocations.map(loc => ({
  name: loc,
  prod: loc.indexOf('staging') === -1,
  environment: 'public',
  uri: `https://functions-${loc}.azurewebsites.net/api/version`,
}));
functionObjs.push({
  name: 'next',
  prod: false,
  environment: 'public',
  uri: `https://functions-next.azure.com/api/version`,
});
functionObjs.push({
  name: 'mooncake',
  prod: true,
  environment: 'mooncake',
  uri: `https://functions.ext.azure.cn/api/version`,
});
functionObjs.push({
  name: 'mooncake-staging',
  prod: false,
  environment: 'mooncake',
  uri: `https://functions-china-east-staging.chinacloudsites.cn/api/version`,
});
functionObjs.push({
  name: 'fairfax',
  prod: true,
  environment: 'fairfax',
  uri: `https://functions.ext.azure.us/api/version`,
});
functionObjs.push({
  name: 'fairfax-staging',
  prod: false,
  environment: 'fairfax',
  uri: `https://functions-usgov-iowa-staging.azurewebsites.us/api/version`,
});
functionObjs.push({
  name: 'blackforest',
  prod: true,
  environment: 'blackforest',
  uri: `https://functions.ext.microsoftazure.de/api/version`,
});
functionObjs.push({
  name: 'blackforest-staging',
  prod: false,
  environment: 'blackforest',
  uri: `https://functions-germany-central-staging.azurewebsites.de/api/version`,
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDevOpsBuild = async (version, retry = 0) => {
  const versionSplit = version.split('.');
  const v = versionSplit[versionSplit.length - 1];
  try {
    const call = await axios.get(`https://azure-functions-ux.visualstudio.com/95c5b65b-c568-42b7-8b23-d8e9640a79dd/_apis/build/builds/${v}`);
    const BuildInfo = call.data;
    if (call.status === 200) {
      return {
        id: BuildInfo.id,
        buildNumber: BuildInfo.buildNumber,
        status: BuildInfo.status,
        result: BuildInfo.result,
        startTime: BuildInfo.startTime,
        finishTime: BuildInfo.finishTime,
        url: BuildInfo.url,
        sourceBranch: BuildInfo.sourceBranch.split('/')[2],
        sourceVersion: BuildInfo.sourceVersion,
        requestedFor: {
          displayName: BuildInfo.requestedFor.displayName,
        },
      };
    }
    if(retry < 5){
      await sleep(5000);
      return getDevOpsBuild(version, retry+1);
    }
    return null;
  } catch (err) {
    if(retry < 5){
      await sleep(5000);
      return getDevOpsBuild(version, retry+1);
    }
    return null;
  }
};

const getGithubSinceLast = async (commitId1, commitId2, retry = 0) => {
  try {
    const diffUrl = `https://api.github.com/repos/azure/azure-functions-ux/compare/${commitId1}...${commitId2}`;
    const call = await axios.get(diffUrl);
    if (call.status === 200) {
      const commitsData = call.data.commits.map(x => {
        return {
          sha: x.sha,
          commit: {
            author: x.commit.author,
            committer: x.commit.commiter,
            message: x.commit.message,
          },
        };
      });
      return {commits: commitsData, diffUrl};
    }
    if(retry < 5){
      await sleep(5000);
      return getGithubSinceLast(commitId1, commitId2, retry+1);
    }
    return null;
  } catch (err) {
    if(retry < 5){
      await sleep(5000);
      return getGithubSinceLast(commitId1, commitId2, retry+1);
    }
    return null;
  }
};

const isNewerVersion = (lastVersion, newVersion) => {
  const lastVersionSplit = lastVersion.split('.');
  const newVersionSplit = newVersion.split('.');
  const lastVersionBuildNumber = +lastVersionSplit[lastVersionSplit.length - 1];
  const newVersionBuildNumber = +newVersionSplit[newVersionSplit.length - 1];
  return newVersionBuildNumber > lastVersionBuildNumber;
};
export async function run(context: any, req: any) {
  const connection: Connection = await createConnection({
    type: 'postgres',
    host: process.env.POSTGRES_ENDPOINT,
    port: 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: true,
    entities: [DevOpsData, FusionVersion, GithubCommit],
  });

  const promises = functionObjs.map(async obj => {
    const versionUri = obj.uri;
    const versionFileCall = await axios.get(versionUri);
    const devOpsData = await getDevOpsBuild(versionFileCall.data);
    let document = {
      name: obj.name,
      prod: obj.prod,
      version: versionFileCall.data,
      devOpsData,
      lastVersion: null,
      githubCommitData: null,
      diffUrl: null
    };

    const lastVersion = await connection.manager
      .getRepository(FusionVersion)
      .createQueryBuilder('version')
      .where('version.name = :name', { name: obj.name })
      .leftJoinAndSelect("version.devOpsData", "DevOpsData")
      .orderBy('version.createdAt', 'DESC', 'NULLS LAST')
      .getOne();
    if (!lastVersion || lastVersion.version !== versionFileCall.data) {
      if (lastVersion) {
        document.lastVersion = lastVersion.version;
        if (isNewerVersion(document.lastVersion, document.version)) {
          const githubCommitData = await getGithubSinceLast(lastVersion.devOpsData.sourceVersion, devOpsData.sourceVersion);
          document.githubCommitData = githubCommitData.commits;
          document.diffUrl = githubCommitData.diffUrl;
        }
      }
      const post = connection.manager.create(FusionVersion, document);
      await connection.manager.save(FusionVersion, post);
      await axios({
        method: 'post',
        url: process.env.EventWebhookUrl,
        data: {
          environment: document.prod ? "prod" : 'state',
          portal: "fusion",
          oldVersion: !lastVersion ? '' : lastVersion.version,
          newVersion: document.version,
          regions: document.name,
          link: `https://uxversions.azurefd.net/fusion/history/${document.name}`
        }
      })
    }
  });
  await Promise.all(promises);
  connection.close();
}
