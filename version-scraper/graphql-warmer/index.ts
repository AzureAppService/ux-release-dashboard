import { request } from "graphql-request";

export async function run(context: any, req: any) {
  const locations = [
    "next",
    "blackforest",
    "mooncake",
    "fairfax",
    "blu",
    "db3",
    "bay",
    "india",
    "france",
    "hk1",
    "brazil",
    "australia",
    "blu-staging",
    "db3-staging",
    "bay-staging",
    "india-staging",
    "france-staging",
    "hk1-staging",
    "brazil-staging",
    "australia-staging"
  ];

  const fusionQuerys = locations.map(
    x => `{
    getFusionLocation(location: "${x}") {
      name
      versionHistory {
        version
        diffUrl
        createdAt
        githubCommitData {
            sha
            commit {
              author {
                name
                avatar_url
              }
              message
            }
          
        }
        devOpsData {
          sourceVersion
          requestedFor {
            displayName
          }
        }
      }
    }
  }`
  );

  const homeQuery = `{
    fusionLocations {
      name
      prod
      cloud
      latestVersion {
        version
        createdAt
      }
    }
    ibizaStages {
      name
      cloud
      latestVersion {
        name
        version
        createdAt
      }
    }
  }`;

  await Promise.all([...fusionQuerys.map(q => request("https://graphqlv3.azurewebsites.net/graphql", q)), request("https://graphqlv3.azurewebsites.net/graphql", homeQuery)]);
  
}
