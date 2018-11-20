import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Timeline, TimelineEvent } from "react-event-timeline";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import dayjs from "dayjs";
import { Breadcrumb } from "office-ui-fabric-react/lib/Breadcrumb";
import { navigate } from "@reach/router";

export default function FusionHistory(props) {
  const onNavHome = () => {
    navigate("/");
  };
  return (
    <>
      <Breadcrumb
        styles={{
          root: { borderBottom: "1px solid black", paddingBottom: "5px" }
        }}
        items={[
          { text: "Home", key: "f1", onClick: onNavHome },
          { text: `${props.loc} history`, key: "f2" }
        ]}
      />
      <Query
        query={gql`
        {
          getIbizaStage(name: "${props.loc}") {
            name
            versionHistory {
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
          const versionHistory = data.getIbizaStage.versionHistory;

          return (
            <Timeline>
              {versionHistory.map(version => (
                <TimelineEvent
                  titleStyle={{ fontWeight: "bold", fontSize: "14px" }}
                  createdAtStyle={{ fontWeight: "bold", fontSize: "14px" }}
                  title={`Version: ${version.version}`}
                  createdAt={dayjs(
                    new Date(version.timeStamp).toLocaleString("en-US", {
                      timeZone: "America/New_York"
                    })
                  ).format("YYYY-MM-DD HH:mm:ss")}
                  icon={<Icon iconName="vstslogo" />}
                />
              ))}
            </Timeline>
          );
        }}
      </Query>
    </>
  );
}
