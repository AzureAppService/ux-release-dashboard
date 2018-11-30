const express = require("express");
const http = require("http");
const { ApolloServer, gql } = require("apollo-server-express");
const axios = require("axios");
const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb://uxversions:j9dcOxigA89J15Ru7nVXQDWGXv5iHGjlJ0XuJ5ZvA8LjmUwygOW7nh3HNecQj6QNv7YH45OfvXWjqo1DgZYJ2g%3D%3D@uxversions.documents.azure.com:10255/?ssl=true&replicaSet=globaldb"; // process.env.MONGO_DB_CONNECTION_STRING;
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
    devOpsData: DevOpsBuild
    githubCommitData: GitCommitDiff
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

  type File {
    sha: String
    filename: String
    status: String
    additions: Int
    deletions: Int
    changes: Int
  }
  type CommitPerson {
    name: String
    email: String
    date: String
  }
  type CommitData {
    author: CommitPerson
    commiter: CommitPerson
    message: String
    url: String
  }
  type CommitAuthor {
    login: String
    avatar_url: String
    url: String
  }
  type Commit {
    sha: String
    node_id: String
    commit: CommitData
    url: String
    html_url: String
    comments_url: String
    author: CommitAuthor
    commiter: CommitAuthor
  }

  type GitCommitDiff {
    ahead_by: Int
    commits: [Commit]
    diff_url: String
    files: [File]
    html_url: String
    permalink_url: String
    status: String
    total_commits: Int
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
      const dbo = db.db("versions2");
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
  FusionLocation: {
    latestVersion: async location => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions2");
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
      const dbo = db.db("versions2");
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

const server = new ApolloServer({ typeDefs, resolvers, introspection: true });

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

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
var httpServer = http.createServer(app);
httpServer.listen(port);
