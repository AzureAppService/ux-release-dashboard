import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

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
            <h1>Ibiza Production</h1>
            <div style={{ marginLeft: "20px" }}>
              {data.ibizaStages
                .filter(x => IbizaProdStages.includes(x.name))
                .map(({ name, latestVersion }) => (
                  <div key={name}>
                    <b>{name}</b> ({IbizaProdToRegion[name]}): {latestVersion.version}
                  </div>
                ))}
            </div>
            <h1>Ibiza Stages</h1>
            <div style={{ marginLeft: "20px" }}>
              {data.ibizaStages
                .filter(x => !IbizaProdStages.includes(x.name))
                .map(({ name, latestVersion }) => (
                  <div key={name}>
                    <b>{name}</b>: {latestVersion.version}
                  </div>
                ))}
            </div>
          </>
        );
      }}
    </Query>
  );
};

export default ibizaStages;
