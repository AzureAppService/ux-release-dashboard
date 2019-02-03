import React from "react";

import VersionCard from "./components/VersionCard";

const FusionLocations = props => {
  return (
    <>
      <VersionCard
        header="Fusion Production"
        items={props.fusionLocs
          .filter(x => x.prod)
          .map(x => ({
            name: x.name,
            version: x.latestVersion.version,
            createdAt: x.latestVersion.createdAt
          }))}
      />
      <VersionCard
        header="Fusion Staged"
        items={props.fusionLocs
          .filter(x => !x.prod)
          .map(x => ({
            name: x.name,
            version: x.latestVersion.version,
            createdAt: x.latestVersion.createdAt
          }))}
      />
    </>
  );
};

export default FusionLocations;
