const { gql, ApolloServer } = require("apollo-server-azure-functions");
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_DB_CONNECTION_STRING;


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type IbizaVersion {
    name: String
    version: String
    timeStamp: String
  }
  type fusionVersion {
      name: String
      prod: Boolean
      version: String
      timeStamp: String
  }
  type Query {
    ibiza: [IbizaVersion]
    fusion: [fusionVersion]
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    ibiza: async () => {
      const db = await MongoClient.connect(url);
      const dbo = db.db("versions");
      return await dbo
        .collection("ibiza")
        .find()
        .toArray();
    },
    fusion: async () => {
        const db = await MongoClient.connect(url);
        const dbo = db.db("versions");
        return await dbo
          .collection("fusion")
          .find()
          .toArray();
      }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server.createHandler();
