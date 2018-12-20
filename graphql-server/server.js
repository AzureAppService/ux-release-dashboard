const express = require('express');
const http = require('http');
const { ApolloServer, gql } = require('apollo-server-express');

const {  timer } = require('rxjs');
const {  concatMap } = require('rxjs/operators');

const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_DB_CONNECTION_STRING;

const dbp = MongoClient.connect(
  url,
  { useNewUrlParser: true },
);
const page_size = 40;
const source = timer(0, 60000);
let fusionLocations = [];
let ibizaStages = [];

source
  .pipe(
    concatMap(async _ => {
      const db = await dbp;
      const dbo = db.db('versions2');
      return await dbo
        .collection('fusion')
        .find()
        .count();
    }),
    concatMap(async count => {
      const db = await dbp;
      const dbo = db.db('versions2');
      allPromises = [];
      for (let i = 0; i < count / page_size; i = i + 1) {
        allPromises.push(
          dbo
            .collection('fusion')
            .find()
            .sort({ timeStamp: -1 })
            .limit(page_size)
            .skip(i * page_size)
            .toArray(),
        );
      }
      return await Promise.all(allPromises);
    }),
  )
  .subscribe(x => {
    let t = [];
    x.forEach(m => {
      t = t.concat(m);
    });
    fusionLocations = t;
    console.log(JSON.stringify(fusionLocations).length);
  });


source
.pipe(
  concatMap(async _ => {
    const db = await dbp;
    const dbo = db.db('versions');
    return await dbo
      .collection('ibiza')
      .find()
      .count();
  }),
  concatMap(async count => {
    const db = await dbp;
    const dbo = db.db('versions');
    allPromises = [];
    for (let i = 0; i < count / page_size; i = i + 1) {
      allPromises.push(
        dbo
          .collection('ibiza')
          .find()
          .sort({ timeStamp: -1 })
          .limit(page_size)
          .skip(i * page_size)
          .toArray(),
      );
    }
    return await Promise.all(allPromises);
  }),
)
.subscribe(x => {
  let t = [];
  x.forEach(m => {
    t = t.concat(m);
  });
  ibizaStages = t;
  console.log(JSON.stringify(ibizaStages).length);
});
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
      const all = ibizaStages;
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
      const all = ibizaStages.filter(x=> x.name === name);
      return {
        name,
        latestVersion: all[0],
        versionHistory: all,
      };
    },
    fusionLocations: async (obj, { prodOnly }) => {
      let all = fusionLocations;
      if (prodOnly) {
        all = fusionLocations.filter(x=> x.prod);
      }
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
      const all = fusionLocations.filter(x=> x.name === location)
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
