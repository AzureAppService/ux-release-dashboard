const express = require("express");
const http = require('http')
const { ApolloServer, gql } = require("apollo-server-express");
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_DB_CONNECTION_STRING;
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Stage {
    name: String!
    latestVersion: IbizaVersion
    versionHistory: [IbizaVersion]
  }

  type IbizaVersion {
    name: String!
    version: String!
    timeStamp: String!
  }

  type FusionLocation {
    name: String!
    url: String!
    prod: Boolean!
    latestVersion: FusionVersion
    versionHistory: [FusionVersion]
  }

  type FusionVersion {
    name: String!
    prod: Boolean!
    version: String!
    timeStamp: String!
    devOpsBuild: DevOpsBuild
  }

  type DevOpsBuild {
    id: Int!
    buildNumber: String!
    status: String!
    result: String!
    queueTime: String!
    startTime: String!
    finishTime: String!
    url: String!
    sourceBranch: String!
    sourceVersion: String!
    requestedFor: requestedFor
  }

  type requestedFor {
    displayName: String!
  }
  type GitCommit {
    sha: String!
  }
  type Query {
    ibizaStages: [Stage]
    getIbizaStage(name: String): Stage
    fusionLocations(prodOnly: Boolean): [FusionLocation]
    getFusionLocation(location: String): FusionLocation
  }
`;

const resolvers = {
  Query: {
    ibizaStages: async () => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const all = await dbo
        .collection("ibiza")
        .find()
        .toArray();
      if (all.length > 0) {
        return Array.from(new Set(all.map(x => x.name))).map(name => ({
          name
        }));
      }
      return null;
    },
    getIbizaStage: async (obj, { name }) => {
      return {
        name
      };
    },
    fusionLocations: async (obj, { prodOnly }) => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const query = {};
      if (prodOnly) {
        query.prod = true;
      }
      const all = await dbo
        .collection("fusion")
        .find(query)
        .toArray();
      if (all.length > 0) {
        return Array.from(new Set(all.map(x => x.name))).map(name => ({
          name,
          url: `functions-${name}.azurewebsites.net`,
          prod: all.find(x => x.name === name).prod
        }));
      }
      return null;
    },
    getFusionLocation: async (obj, { location }) => {
      return {
        name: location,
        url: `functions-${location}.azurewebsites.net`,
        prod: location.indexOf("Staging") === -1
      };
    }
  },
  FusionVersion: {
    devOpsBuild: async FunctionVersion => {
      const { version } = FunctionVersion;
      const versionSplit = version.split(".");
      const v = versionSplit[versionSplit.length - 1];
      const call = await axios.get(
        `https://azure-functions-ux.visualstudio.com/95c5b65b-c568-42b7-8b23-d8e9640a79dd/_apis/build/builds/${v}`
      );
      const BuildInfo = call.data;
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
  },
  FusionLocation: {
    latestVersion: async location => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const all = await dbo
        .collection("fusion")
        .find({ name: location.name })
        .sort({ timeStamp: -1 })
        .toArray();
      if (all.length > 0) {
        return all[0];
      }
      return null;
    },
    versionHistory: async location => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const all = await dbo
        .collection("fusion")
        .find({ name: location.name })
        .sort({ timeStamp: -1 })
        .toArray();
      return all;
    }
  },
  Stage: {
    latestVersion: async stage => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const all = await dbo
        .collection("ibiza")
        .find({ name: stage.name })
        .sort({ timeStamp: -1 })
        .toArray();
      if (all.length > 0) {
        return all[0];
      }
      return null;
    },
    versionHistory: async stage => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      const all = await dbo
        .collection("ibiza")
        .find({ name: stage.name })
        .sort({ timeStamp: -1 })
        .toArray();
      return all;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var httpServer = http.createServer(app);
httpServer.listen(port);