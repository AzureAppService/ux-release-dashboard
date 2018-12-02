const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_DB_CONNECTION_STRING;

module.exports = async function(context, myTimer) {
  const getGithubSinceLast = async (commitId1, commitId2) => {
    try {
      const call = await axios.get(
        `https://api.github.com/repos/azure/azure-functions-ux/compare/${commitId1}...${commitId2}`
      );
      if (call.status === 200) {
        const {
          ahead_by,
          commits,
          diff_url,
          files,
          html_url,
          permalink_url,
          status,
          total_commits
        } = call.data;
        return {
          ahead_by,
          commits,
          diff_url,
          files,
          html_url,
          permalink_url,
          status,
          total_commits
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const getDevOpsBuild = async version => {
    const versionSplit = version.split(".");
    const v = versionSplit[versionSplit.length - 1];
    try {
      const call = await axios.get(
        `https://azure-functions-ux.visualstudio.com/95c5b65b-c568-42b7-8b23-d8e9640a79dd/_apis/build/builds/${v}`
      );
      const BuildInfo = call.data;
      if (call.status === 200) {
        return {
          id: BuildInfo.id,
          buildNumber: BuildInfo.buildNumber,
          status: BuildInfo.status,
          result: BuildInfo.result,
          queueTime: BuildInfo.queueTime,
          startTime: BuildInfo.startTime,
          finishTime: BuildInfo.finishTime,
          url: BuildInfo.url,
          sourceBranch: BuildInfo.sourceBranch.split("/")[2],
          sourceVersion: BuildInfo.sourceVersion,
          requestedFor: {
            displayName: BuildInfo.requestedFor.displayName
          }
        };
      }
      return {
        id: "",
        buildNumber: "",
        status: "",
        result: "",
        queueTime: "",
        startTime: "",
        finishTime: "",
        url: "",
        sourceBranch: "",
        sourceVersion: "",
        requestedFor: {
          displayName: ""
        },
        deploymentRegion: ""
      };
    } catch (err) {
      return {
        id: "",
        buildNumber: "",
        status: "",
        result: "",
        queueTime: "",
        startTime: "",
        finishTime: "",
        url: "",
        sourceBranch: "",
        sourceVersion: "",
        requestedFor: {
          displayName: ""
        },
        deploymentRegion: ""
      };
    }
  };
  try {
    const fusionLocations = [
      "db3",
      "hk1",
      "bay",
      "blu",
      "france",
      "india",
      "brazil",
      "australia",
      "db3-staging",
      "hk1-staging",
      "bay-staging",
      "blu-staging",
      "france-staging",
      "india-staging",
      "brazil-staging",
      "australia-staging"
    ];
    const functionObjs = fusionLocations.map(loc => ({
      name: loc,
      prod: !loc.includes("staging"),
      environment: "public",
      uri: `https://functions-${loc}.azurewebsites.net/api/version`
    }));
    functionObjs.push({
      name: "next",
      prod: false,
      environment: "public",
      uri: `https://functions-next.azure.com/api/version`
    });
    functionObjs.push({
      name: "mooncake",
      prod: true,
      environment: "mooncake",
      uri: `https://functions.ext.azure.cn/api/version`
    });
    functionObjs.push({
      name: "mooncake-staging",
      prod: false,
      environment: "mooncake",
      uri: `https://functions-china-east-staging.chinacloudsites.cn/api/version`
    });
    functionObjs.push({
      name: "fairfax",
      prod: true,
      environment: "fairfax",
      uri: `https://functions.ext.azure.us/api/version`
    });
    functionObjs.push({
      name: "fairfax-staging",
      prod: false,
      environment: "fairfax",
      uri: `https://functions-usgov-iowa-staging.azurewebsites.us/api/version`
    });
    functionObjs.push({
      name: "blackforest",
      prod: true,
      environment: "blackforest",
      uri: `https://functions.ext.microsoftazure.de/api/version`
    });
    functionObjs.push({
      name: "blackforest-staging",
      prod: false,
      environment: "blackforest",
      uri: `https://functions-germany-central-staging.azurewebsites.de/api/version`
    });
    const timeStamp = new Date().toISOString();
    const db = await MongoClient.connect(url);
    const dbo = db.db("versions2");
    const promises = functionObjs.map(async obj => {
      const versionUri = obj.uri;
      const versionFileCall = await axios.get(versionUri);
      const devOpsData = await getDevOpsBuild(versionFileCall.data);
      let document = {
        name: obj.name,
        prod: obj.prod,
        version: versionFileCall.data,
        timeStamp,
        devOpsData,
        lastVersion: null,
        githubCommitData: null
      };
      const isNewerVersion = (lastVersion, newVersion) => {
        const lastVersionSplit = lastVersion.split(".");
        const newVersionSplit = newVersion.split(".");
        const lastVersionBuildNumber = +lastVersionSplit[
          lastVersionSplit.length - 1
        ];
        const newVersionBuildNumber = +newVersionSplit[
          newVersionSplit.length - 1
        ];
        return newVersionBuildNumber > lastVersionBuildNumber;
      };
      try {
        var query = { name: obj.name };
        const lastInsertedVersion = await dbo
          .collection("fusion")
          .find(query)
          .limit(1)
          .sort({ timeStamp: -1 })
          .toArray();
        if (
          lastInsertedVersion.length === 0 ||
          lastInsertedVersion[0].version !== versionFileCall.data
        ) {
          if (lastInsertedVersion.length !== 0) {
            document.lastVersion = lastInsertedVersion[0].version;
            const vcompare = QVersion.version_compare(
              document.lastVersion,
              document.version
            );
            if (isNewerVersion(document.lastVersion, document.version)) {
              const githubCommitData = await getGithubSinceLast(
                lastInsertedVersion[0].devOpsData.sourceVersion,
                devOpsData.sourceVersion
              );
              document.githubCommitData = githubCommitData;
            }
          }
          await dbo.collection("fusion").insertOne(document);
          context.log("inserted a new version");
        }
      } catch (err) {
        context.log(err);
        context.log(obj.name);
      }
    });

    await Promise.all(promises);
    db.close();
  } catch (err) {
    context.log(err);
    db.close();
  }
};
