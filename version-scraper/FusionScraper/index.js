const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const url =
  process.env.MONGO_DB_CONNECTION_STRING;

module.exports = async function(context, myTimer) {
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
      "australia-staging",
    ];
    const functionObjs = fusionLocations.map(loc=> ({
      name: loc,
      prod: loc.includes("staging"),
      environment: 'public',
      uri: `https://functions-${loc}.azurewebsites.net/api/version`
    }));
    functionObjs.push({
      name: 'next',
      prod: false,
      environment: 'public',
      uri: `https://functions-next.azure.com/api/version`
    });
    functionObjs.push({
      name: 'mooncake',
      prod: true,
      environment: 'mooncake',
      uri: `https://functions.ext.azure.cn/api/version`
    });
    functionObjs.push({
      name: 'mooncake-staging',
      prod: false,
      environment: 'mooncake',
      uri: `https://functions-china-east-staging.chinacloudsites.cn/api/version`
    });
    functionObjs.push({
      name: 'fairfax',
      prod: true,
      environment: 'fairfax',
      uri: `https://functions.ext.azure.us/api/version`
    });
    functionObjs.push({
      name: 'fairfax-staging',
      prod: false,
      environment: 'fairfax',
      uri: `https://functions-usgov-iowa-staging.azurewebsites.us/api/version`
    });
    functionObjs.push({
      name: 'blackforest',
      prod: true,
      environment: 'blackforest',
      uri: `https://functions.ext.microsoftazure.de/api/version`
    });
    functionObjs.push({
      name: 'blackforest-staging',
      prod: false,
      environment: 'blackforest',
      uri: `https://functions-germany-central-staging.azurewebsites.de/api/version`
    });
    const timeStamp = new Date().toISOString();
    const db = await MongoClient.connect(url);
    const dbo = db.db("versions");
    const promises = functionObjs.map(async obj => {
      const versionUri = obj.uri;
      const versionFileCall = await axios.get(versionUri);
      const document = {
        name: obj.name,
        prod: obj.prod,
        version: versionFileCall.data,
        timeStamp
      };

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
        await dbo.collection("fusion").insertOne(document);
        context.log("inserted a new version");
      } else {
        context.log("version already exists");
      }
    });

    await Promise.all(promises);
    db.close();
  } catch (err) {
    context.log(err);
    db.close();
  }
};
