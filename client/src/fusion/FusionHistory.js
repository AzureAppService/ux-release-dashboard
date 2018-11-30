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
export default function FusionHistory(props) {
  const onBuildClick = buildNumber => {
    const versionSplit = buildNumber.split(".");
    const bn = versionSplit[versionSplit.length - 1];
    window.open(
      `https://azure-functions-ux.visualstudio.com/azure-functions-ux/_build/results?buildId=${bn}`,
      "_blank"
    );
  };
  const onCommitClick = url => {
    window.open(url, "_blank");
  };
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
  getFusionLocation(location: "${props.loc}") {
    name
    versionHistory {
      version
      timeStamp
      githubCommitData {
        permalink_url
        total_commits
        files {
          filename
        }
        commits {
          sha
          commit {
            author {
              name
            }
            message
          }
        }
      }
      devOpsData {
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
                  createdAt={moment
                    .utc(version.timeStamp)
                    .local()
                    .format("YYYY-MM-DD hh:mm a")}
                  icon={<Icon iconName="vstslogo" />}
                >
                  {version.githubCommitData && (
                    <div>
                      <h3 style={{ marginBottom: "5px" }}>Commits: </h3>
                      <ul
                        style={{
                          fontSize: ".8rem",
                          marginLeft: "20px",
                          listStyleType: "square"
                        }}
                      >
                        {version.githubCommitData.commits.map(commit => (
                          <li>
                            {`'${commit.commit.message}' by ${
                              commit.commit.author.name
                            }`}{" "}
                            |{" "}
                            <a
                              href={`https://github.com/azure/azure-functions-ux/commit/${
                                commit.sha
                              }`} target="_blank"
                            >
                              {commit.sha}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ActionButton
                    iconProps={{ iconName: "link" }}
                    allowDisabledFocus={true}
                    onClick={() =>
                      onCommitClick(version.githubCommitData.permalink_url)
                    }
                  >
                    See changes from last release
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
