import React from "react";
import VersionCard from "./components/VersionCard";

const IbizaProdStages = ["stage1", "stage2", "stage3", "stage4", "stage5"];
const IbizaProdToRegion = {
  stage1: "Central US EUAP",
  stage2: "West Central US",
  stage3: "South Central US",
  stage4: "West US",
  stage5: "World"
};
const ibizaStages = props => {
  return (
    <>
      <VersionCard
        header="Ibiza Production"
        items={props.ibizaStages
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
        items={props.ibizaStages
          .filter(x => !IbizaProdStages.includes(x.name))
          .map(x => ({
            name: x.name,
            version: x.latestVersion.version,
            timeStamp: x.latestVersion.timeStamp
          }))}
      />
    </>
  );
};

export default ibizaStages;
