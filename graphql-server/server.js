const express = require('express');
const http = require('http');
const { ApolloServer, gql } = require('apollo-server-express');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_DB_CONNECTION_STRING;
const dbp = MongoClient.connect(
  url,
  { useNewUrlParser: true },
);
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
      const db = await dbp;
      const dbo = db.db('versions');
      const count = await dbo
        .collection('ibiza')
        .find()
        .count();
      allPromises = [];
      for (let i = 0; i < count / 30; i = i + 1) {
        allPromises.push(
          dbo
            .collection('ibiza')
            .find()
            .sort({ timeStamp: -1 })
            .limit(30)
            .skip(i * 30)
            .toArray(),
        );
      }
      allp = await Promise.all(allPromises);
      let all = [];
      allp.forEach(a => {
        all = all.concat(a);
      });
      if (all.length > 0) {
        return Array.from(new Set(all.map(x => x.name))).map(name => {
          const vals = all.filter(x => x.name === name);
          return {
            name,
            latestVersion: vals[0],
            versionHistory: vals,
          };
        });
      }
      return null;
    },
    getIbizaStage: async (obj, { name }) => {
      const db = await dbp;
      const dbo = db.db('versions');
      const count = await dbo
        .collection('ibiza')
        .find({ name })
        .count();
      allPromises = [];
      for (let i = 0; i < count / 30; i = i + 1) {
        allPromises.push(
          dbo
            .collection('ibiza')
            .find({ name })
            .sort({ timeStamp: -1 })
            .limit(30)
            .skip(i * 30)
            .toArray(),
        );
      }
      allp = await Promise.all(allPromises);
      let all = [];
      allp.forEach(a => {
        all = all.concat(a);
      });
      return {
        name,
        latestVersion: all[0],
        versionHistory: all,
      };
    },
    fusionLocations: async (obj, { prodOnly }) => {
      const db = await dbp;
      const dbo = db.db('versions2');
      const query = {};
      if (prodOnly) {
        query.prod = true;
      }
      const count = await dbo
        .collection('fusion')
        .find(query)
        .count();
      allPromises = [];
      for (let i = 0; i < count / 30; i = i + 1) {
        allPromises.push(
          dbo
            .collection('fusion')
            .find(query)
            .sort({ timeStamp: -1 })
            .limit(30)
            .skip(i * 30)
            .toArray(),
        );
      }
      allp = await Promise.all(allPromises);
      let all = [];
      allp.forEach(a => {
        all = all.concat(a);
      });

      if (all.length > 0) {
        return Array.from(new Set(all.map(x => x.name))).map(name => {
          const vals = all.filter(x => x.name === name);
          return {
            name,
            url: `functions-${name}.azurewebsites.net`,
            prod: all.find(x => x.name === name).prod,
            latestVersion: vals[0],
            versionHistory: vals,
          };
        });
      }
      return null;
    },
    getFusionLocation: async (obj, { location }) => {
      const db = await dbp;
      const dbo = db.db('versions2');
      const query = { name: location };
      const count = await dbo
        .collection('fusion')
        .find(query)
        .count();
      allPromises = [];
      for (let i = 0; i < count / 30; i = i + 1) {
        allPromises.push(
          dbo
            .collection('fusion')
            .find(query)
            .sort({ timeStamp: -1 })
            .limit(30)
            .skip(i * 30)
            .toArray(),
        );
      }
      allp = await Promise.all(allPromises);
      let all = [];
      allp.forEach(a => {
        all = all.concat(a);
      });
      return {
        name: location,
        url: `functions-${location}.azurewebsites.net`,
        prod: location.indexOf('Staging') === -1,
        latestVersion: all[0],
        versionHistory: all,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers, introspection: true, cacheControl: true, tracing: true });

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
