import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import VersionCard from "../components/VersionCard";

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
          <div style={{ display: "inline-block" }}>
            <VersionCard
              style={{ width: "500px" }}
              header="Fusion Production"
              items={data.fusionLocations
                .filter(x => x.prod)
                .map(x => ({
                  label: x.name,
                  value: x.latestVersion.version
                }))}
            />
            <VersionCard
              style={{ width: "500px" }}
              header="Fusion Staged"
              items={data.fusionLocations
                .filter(x => !x.prod)
                .map(x => ({
                  label: x.name,
                  value: x.latestVersion.version
                }))}
            />
            {/* <h1>Fusion Staged</h1>
            <div style={{ marginLeft: "20px" }}>
              {data.fusionLocations
                .filter(x => !x.prod)
                .map(({ name, latestVersion }) => (
                  <div key={name}>
                    <b>{name}</b> :{" "}
                    <a
                      href={latestVersion.devOpsBuild.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: "10px" }}
                    >
                      {latestVersion.version}
                    </a>
                    (Deployed: {latestVersion.timeStamp})
                  </div>
                ))}
            </div> */}
          </div>
        );
      }}
    </Query>
  );
};

export default FusionLocations;
