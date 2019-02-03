import React from "react";
import FusionLocations from "./fusion/FusionLocations";
import IbizaStages from "./ibiza/IbizaStages";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import LoadingPage from "./LoadingPage";
export default function Dashboard() {
  return (
    <Query
      query={gql`
        {
          fusionLocations {
            name
            prod
            latestVersion {
              version
              createdAt
            }
          }
          ibizaStages {
            name
            latestVersion {
              name
              version
              createdAt
            }
          }
        }
      `}
      pollInterval={30000}
    >
      {({ loading, error, data }) => {
        if (loading) return <LoadingPage />;
        if (error) return <p>Error :(</p>;

        return (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <IbizaStages ibizaStages={data.ibizaStages} />
            <FusionLocations fusionLocs={data.fusionLocations} />
          </div>
        );
      }}
    </Query>
  );
}
