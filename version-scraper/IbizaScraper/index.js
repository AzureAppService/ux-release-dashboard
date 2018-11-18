const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const url =
  process.env.MONGO_DB_CONNECTION_STRING;
module.exports = async function(context, myTimer) {
  const ibizaVersionsUri =
    "https://appsvcstorage.blob.core.windows.net/hostingsvcprod/config.json";

  const timeStamp = new Date().toISOString();
  const versionFileCall = await axios.get(ibizaVersionsUri);
  const versionFile = Object.keys(versionFileCall.data)
    .filter(x => !x.includes("$"))
    .map(x => ({
      name: x,
      version: versionFileCall.data[x],
      timeStamp
    }));
  const db = await MongoClient.connect(url);
  try {
    context.log(versionFile);

    const dbo = db.db("versions");
    const p = versionFile.map(async v => {
      var query = { name: v.name };
      const lastInsertedVersion = await dbo
        .collection("ibiza")
        .find(query)
        .limit(1)
        .sort({ timeStamp: -1 })
        .toArray();

      if (
        lastInsertedVersion.length === 0 ||
        lastInsertedVersion[0].version !== v.version
      ) {
        const t = await dbo.collection("ibiza").insertOne(v);
        context.log("inserted a new version");
      } else {
        context.log("version already exists");
      }
    });
    await Promise.all(p);
    db.close();
  } catch (err) {
    context.log(err);
    db.close();
  }
};
