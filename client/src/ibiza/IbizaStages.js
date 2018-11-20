import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import VersionCard from "./components/VersionCard";

const IbizaProdStages = ["stage1", "stage2", "stage3", "stage4", "stage5"];
const IbizaProdToRegion = {
  stage1: "Central US EUAP",
  stage2: "West Central US",
  stage3: "South Central US",
  stage4: "West US",
  stage5: "World"
};
const ibizaStages = () => {
  return (
    <Query
      query={gql`
        {
          ibizaStages {
            name
            latestVersion {
              name
              version
              timeStamp
            }
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return console.log(error) && <p>Error :(</p>;

        return (
          <>
            <VersionCard
              header="Ibiza Production"
              items={data.ibizaStages
                .filter(x => IbizaProdStages.includes(x.name))
                .map(x => ({
                  name: `${x.name}`,
                  loc: IbizaProdToRegion[x.name],
                  version: x.latestVersion.version,
                  timeStamp: x.latestVersion.timeStamp
                }))}
            />
            <VersionCard
            header="Ibiza Dev"
            items={data.ibizaStages
              .filter(x => !IbizaProdStages.includes(x.name))
              .map(x => ({
                name: x.name,
                version: x.latestVersion.version,
                timeStamp: x.latestVersion.timeStamp
              }))}
          />
          </>
        );
      }}
    </Query>
  );
};

export default ibizaStages;
