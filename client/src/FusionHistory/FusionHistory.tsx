import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { ReactComponent as Logo } from '../AzureAppService.svg';
import processString from 'react-process-string';
import dayjs from 'dayjs';
import { Button, Divider, Search, SearchProps, Input, InputProps } from 'semantic-ui-react';

const TimelineEventNew = TimelineEvent as any;
const config = [
  {
    regex: /AB#(\d+)/gim,
    fn: (key: any, result: any) => (
      <span key={key}>
        <a target="_blank" rel="noopener noreferrer" href={`https://msazure.visualstudio.com/Antares/_workitems/edit/${result[1]}`}>
          {result[0]}
        </a>
      </span>
    ),
  },
];
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
      <Input style={{marginLeft: '15px', marginRight: '15px'}} fluid icon='search' placeholder='Search...' onChange={handleSearchChange} />
      <Divider  style={{marginBottom:0}}/>
      <Query
        query={gql`
        {
  getFusionLocation(location: "${props.loc}") {
    name
    versionHistory {
      version
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
                    icon={<Logo style={{width:'20px', height: '20px'}} />}
                  >
                    {version.githubCommitData && (
                      <div>
                        <h3 style={{ marginBottom: '5px' }}>Commits: </h3>
                        <ul
                          style={{
                            fontSize: '.9rem',
                            marginLeft: '20px',
                            listStyleType: 'square',
                          }}
                        >
                          {version.githubCommitData.map((commit: any) => (
                            <li
                              style={{
                                opacity:
                                  !!searchTerm && !commit.commit.message.toLowerCase().includes(searchTerm) && !commit.commit.author.name.toLowerCase().includes(searchTerm)
                                    ? 0.3
                                    : 1,
                              }}
                            >
                              {processString(config)(commit.commit.message)} by <b>{commit.commit.author.name}</b>
                              <a rel="noopener noreferrer" href={`https://github.com/azure/azure-functions-ux/commit/${commit.sha}`} target="_blank">
                                {commit.sha}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Divider />
                    <div style={{ float: 'right' }}>
                      <Button style={{ margin: '5px' }} primary onClick={() => onCommitClick(version.githubCommitData.permalink_url)}>
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
