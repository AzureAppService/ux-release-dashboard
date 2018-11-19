import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const FusionLocations = () => {
  return (
    <Query
      query={gql`
        {
          fusionLocations {
            name
            prod
            url
            latestVersion {
              version
              timeStamp
              devOpsBuild {
                sourceVersion
                url
                requestedFor {
                  displayName
                }
              }
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
            <h1>Fusion Production</h1>
            <div style={{ marginLeft: "20px" }}>
              {data.fusionLocations
                .filter(x => x.prod)
                .map(({ name, latestVersion }) => (
                  <div key={name}>
                     <b>{name}</b> :{" "}
                      <a
                        href={latestVersion.devOpsBuild.url}
                        target="_blank"
                        style={{ marginRight: "10px" }}
                      >
                        {latestVersion.version}
                      </a>(Deployed: {latestVersion.timeStamp})
                  </div>
                ))}
            </div>
            <h1>Fusion Staged</h1>
            <div style={{ marginLeft: "20px" }}>
              {data.fusionLocations
                .filter(x => !x.prod)
                .map(({ name, latestVersion }) => (
                  <div key={name}>
                      <b>{name}</b> :{" "}
                      <a
                        href={latestVersion.devOpsBuild.url}
                        target="_blank"
                        style={{ marginRight: "10px" }}
                      >
                        {latestVersion.version} 
                      </a>(Deployed: {latestVersion.timeStamp})
                  </div>
                ))}
            </div>
          </>
        );
      }}
    </Query>
  );
};

export default FusionLocations;
