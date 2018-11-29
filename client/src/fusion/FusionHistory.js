import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Timeline, TimelineEvent } from "react-event-timeline";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import moment from "moment-es6";
import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { Breadcrumb } from "office-ui-fabric-react/lib/Breadcrumb";
import { navigate } from "@reach/router";
import LoadingPage from "../LoadingPage";
import Header from "./components/Header";
export default function FusionHistory(props) {
  const onBuildClick = buildNumber => {
    const versionSplit = buildNumber.split(".");
    const bn = versionSplit[versionSplit.length - 1];
    window.open(
      `https://azure-functions-ux.visualstudio.com/azure-functions-ux/_build/results?buildId=${bn}`,
      "_blank"
    );
  };
  const onCommitClick = commit => {
    window.open(
      `https://github.com/Azure/azure-functions-ux/commit/${commit}`,
      "_blank"
    );
  };
  const onNavHome = () => {
    navigate("/");
  };
  return (
    <>
      <Header pathItems={[
        { text: "Home", key: "f1", onClick: onNavHome },
        { text: `${props.loc} history`, key: "f2" }
      ]} />
      <Query
        query={gql`
        {
          getFusionLocation(location: "${props.loc}") {
            name
            versionHistory {
              version
              timeStamp
              devOpsBuild {
                sourceVersion
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
          if (loading) return <LoadingPage />;
          if (error) return <p>Error :(</p>;
          const versionHistory = data.getFusionLocation.versionHistory;

          return (
            <Timeline>
              {versionHistory.map(version => (
                <TimelineEvent
                  titleStyle={{ fontWeight: "bold", fontSize: "14px" }}
                  createdAtStyle={{ fontWeight: "bold", fontSize: "14px" }}
                  title={`Version: ${version.version}`}
                  createdAt={moment.utc(version.timeStamp).local().format('YYYY-MM-DD hh:mm a')}
                  icon={<Icon iconName="vstslogo" />}
                >
                  <p>
                    requested by {version.devOpsBuild.requestedFor.displayName}
                  </p>
                  <ActionButton
                    iconProps={{ iconName: "link" }}
                    allowDisabledFocus={true}
                    onClick={() =>
                      onCommitClick(version.devOpsBuild.sourceVersion)
                    }
                  >
                    Go To Last Commit
                  </ActionButton>
                  <ActionButton
                    iconProps={{ iconName: "link" }}
                    allowDisabledFocus={true}
                    onClick={() => onBuildClick(version.version)}
                  >
                    Go To Build
                  </ActionButton>
                </TimelineEvent>
              ))}
            </Timeline>
          );
        }}
      </Query>
    </>
  );
}
