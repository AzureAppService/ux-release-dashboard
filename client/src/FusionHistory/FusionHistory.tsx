import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { ReactComponent as Logo } from '../AzureAppService.svg';
import processString from 'react-process-string';
import dayjs from 'dayjs';
import { Button, Divider, Search, SearchProps, Input, InputProps, Table, Label, Tab } from 'semantic-ui-react';
import { Link } from '@reach/router';

const TimelineEventNew = TimelineEvent as any;
const config = [
  {
    regex: /AB#(\d+)?/gim,
    fn: (key: any, result: any) => (
      <span key={key}>
        <a target="_blank" rel="noopener noreferrer" href={`https://msazure.visualstudio.com/Antares/_workitems/edit/${result[1]}`}>
          {result[0]}
        </a>
      </span>
    ),
  },
];

const bulletString = (s: string) => {
  if (s.includes('*')) {
    const sp = s.split('*');
    return (
      <ul>
        {sp.map(v => (
          <li>{processString(config)(v)}</li>
        ))}
      </ul>
    );
  } else {
    return <p>{processString(config)(s)}</p>;
  }
};

const getBugList = (message: string) => {
  const bugRegex = /AB#(\d+)/gim;

  if (message.includes('AB#')) {
    const bugs = message.match(bugRegex);
    return (
      <ul>
        {bugs!.map(v => (
          <li>
            <a target="_blank" rel="noopener noreferrer" href={`https://msazure.visualstudio.com/Antares/_workitems/edit/${v.split('#')[1]}`}>
              {v.replace('AB', '')}
            </a>
          </li>
        ))}
      </ul>
    );
  } else {
    return <p>No Bugs</p>;
  }
};
const FusionHistory = (props: { path: string; loc?: string }) => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const onBuildClick = buildNumber => {
    const versionSplit = buildNumber.split('.');
    const bn = versionSplit[versionSplit.length - 1];
    window.open(`https://azure-functions-ux.visualstudio.com/azure-functions-ux/_build/results?buildId=${bn}`, '_blank');
  };
  const onCommitClick = url => {
    window.open(url, '_blank');
  };
  const handleSearchChange = (e, { value }: InputProps) => {
    setSearchTerm(value);
  };
  return (
    <>
      <h2>Fusion History - {props.loc}</h2>
      <Divider />
      <Input style={{ marginLeft: '15px', marginRight: '15px' }} fluid icon="search" placeholder="Search..." onChange={handleSearchChange} />
      <Divider style={{ marginBottom: 0 }} />
      <Query
        query={gql`
        {
  getFusionLocation(location: "${props.loc}") {
    name
    versionHistory {
      version
      diffUrl
      createdAt
      githubCommitData {
          sha
          commit {
            author {
              name
            }
            message
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
          if (loading) return <div className="ui active centered inline loader" />;
          if (error) return <p>Error :(</p>;
          const versionHistory = data.getFusionLocation.versionHistory;

          return (
            <Timeline>
              {versionHistory
                .filter((x: any) => {
                  if (!searchTerm) return true;
                  if (!x.githubCommitData) return false;
                  const commitMessages = x.githubCommitData.map(y => y.commit.message.toLowerCase());
                  const commitAuthors = x.githubCommitData.map(y => y.commit.author.name.toLowerCase());
                  console.log(commitAuthors, searchTerm);
                  return !!commitMessages.find(x => !!x && x.includes(searchTerm)) || !!commitAuthors.find(x => !!x && x.includes(searchTerm));
                })
                .map((version: any) => (
                  <TimelineEventNew
                    key={version.createdAt}
                    titleStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                    createdAtStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                    title={`Version: ${version.version}`}
                    createdAt={dayjs(version.createdAt).format('YYYY-MM-DD hh:mm a')}
                    icon={<Logo style={{ width: '20px', height: '20px' }} />}
                  >
                    {version.githubCommitData && (
                      <div>
                        <h3 style={{ marginBottom: '5px' }}>Commits: </h3>
                        <Table celled style={{fontSize:'.9rem'}}>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>Author</Table.HeaderCell>
                              <Table.HeaderCell>Message</Table.HeaderCell>
                              <Table.HeaderCell>Bugs</Table.HeaderCell>
                              <Table.HeaderCell>Open</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {version.githubCommitData.map((commit: any) => (
                              <Table.Row
                                style={{
                                  opacity:
                                    !!searchTerm && !commit.commit.message.toLowerCase().includes(searchTerm) && !commit.commit.author.name.toLowerCase().includes(searchTerm)
                                      ? 0.3
                                      : 1,
                                }}
                              >
                                <Table.Cell>
                                  <p>{commit.commit.author.name}</p>
                                </Table.Cell>
                                <Table.Cell>
                                  {/* */}
                                  {bulletString(commit.commit.message)}
                                </Table.Cell>
                                <Table.Cell>{getBugList(commit.commit.message)}</Table.Cell>
                                <Table.Cell>
                                  <Button onClick={() => window.open(`https://github.com/azure/azure-functions-ux/commit/${commit.sha}`, '_blank')}>Open</Button>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </div>
                    )}
                    <Divider />
                    <div style={{ float: 'right' }}>
                      <Button style={{ margin: '5px' }} disabled={!version.diffUrl} primary onClick={() => onCommitClick(version.diffUrl)}>
                        See changes from last release
                      </Button>
                      <Button style={{ margin: '5px' }} secondary onClick={() => onBuildClick(version.version)}>
                        Go To Build
                      </Button>
                    </div>
                  </TimelineEventNew>
                ))}
            </Timeline>
          );
        }}
      </Query>
    </>
  );
};

export default FusionHistory;
