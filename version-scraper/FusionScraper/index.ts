import { createConnection, Connection, ConnectionManager } from 'typeorm';
import { FusionVersion } from './entities/FusionVersion';
import { DevOpsData } from './entities/DevOpsData';
import { GithubCommit } from './entities/GithubCommits';
import axios from 'axios';
import { GithubCommitAuthor } from './entities/github-user.entity';

const fusionLocations = [
  'db3-ame',
  'sg-ame',
  'bay-ame',
  'blu-ame',
  'france-ame',
  'india-ame',
  'brazil-ame',
  'africa-ame',
  'jp-west-ame',
  'australia-ame',
  'db3-ame-staging',
  'sg-ame-staging',
  'bay-ame-staging',
  'blu-ame-staging',
  'france-ame-staging',
  'india-ame-staging',
  'brazil-ame-staging',
  'australia-ame-staging',
  'africa-ame-staging',
  'jp-west-ame-staging',
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
    if (retry < 5) {
      await sleep(5000);
      return getDevOpsBuild(version, retry + 1);
    }
    return null;
  } catch (err) {
    if (retry < 5) {
      await sleep(5000);
      return getDevOpsBuild(version, retry + 1);
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
        console.log(x);
        return {
          sha: x.sha,
          commit: {
            author: { ...x.commit.author, ...x.author },
            committer: x.commit.commiter,
            message: x.commit.message,
          },
        };
      });
      return { commits: commitsData, diffUrl: call.data.permalink_url };
    }
    if (retry < 5) {
      await sleep(5000);
      return getGithubSinceLast(commitId1, commitId2, retry + 1);
    }
    return null;
  } catch (err) {
    if (retry < 5) {
      await sleep(5000);
      return getGithubSinceLast(commitId1, commitId2, retry + 1);
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
    entities: [DevOpsData, FusionVersion, GithubCommit, GithubCommitAuthor],
  });

  try {
    const getCloud =(name: string) => {
      const cloud = name.split('-')[0].toLowerCase();
      switch(cloud){
        case 'mooncake':
        case 'fairfax':
        case 'blackforest':
          return cloud;
        default:
          return 'public'
      }
    }
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
        diffUrl: null,
        cloud: getCloud(obj.name),
      };

      const lastVersion = await connection.manager
        .getRepository(FusionVersion)
        .createQueryBuilder('version')
        .where('version.name = :name', { name: obj.name })
        .leftJoinAndSelect('version.devOpsData', 'DevOpsData')
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
      }
    });
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
  } finally {
    connection.close();
  }
}
