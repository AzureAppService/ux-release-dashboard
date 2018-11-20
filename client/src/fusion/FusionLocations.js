import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import VersionCard from "./components/VersionCard";

const FusionLocations = () => {
  return (
    <Query
      query={gql`
        {
          fusionLocations {
            name
            prod
            latestVersion {
              version
              timeStamp
            }
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        return (
          <>
            <VersionCard
              header="Fusion Production"
              items={data.fusionLocations
                .filter(x => x.prod)
                .map(x => ({
                  name: x.name,
                  version: x.latestVersion.version,
                  timeStamp: x.latestVersion.timeStamp
                }))}
            />
            <VersionCard
              header="Fusion Staged"
              items={data.fusionLocations
                .filter(x => !x.prod)
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

export default FusionLocations;
