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
    const timeStamp = new Date().toISOString();
    const db = await MongoClient.connect(url);
    const dbo = db.db("versions");
    const promises = fusionLocations.map(async loc => {
      const versionUri = `https://functions-${loc}.azurewebsites.net/api/version`;
      const versionFileCall = await axios.get(versionUri);
      const document = {
        name: loc,
        prod: !loc.includes("staging") && !loc.includes("next"),
        version: versionFileCall.data,
        timeStamp
      };

      var query = { name: loc };
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
