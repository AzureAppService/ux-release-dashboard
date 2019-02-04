import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { ReactComponent as Logo } from '../AzureAppService.svg';
import dayjs from 'dayjs';
import { Divider } from 'semantic-ui-react';
const TimelineEventNew = TimelineEvent as any;

const IbizaHistory = (props: { path: string; loc?: string }) => {
  return (
    <>
      <h2>Ibiza History - {props.loc}</h2>
      <Divider style={{marginBottom:0}}/>
      <Query
        query={gql`
        {
          getIbizaStage(name: "${props.loc}") {
            name
            versionHistory {
              version
              createdAt
            }
          }
        }
      `}
      >
        {({ loading, error, data }) => {
          if (loading) return <div className="ui active centered inline loader" />;
          if (error) return <p>Error :(</p>;
          const versionHistory = data.getIbizaStage.versionHistory;

          return (
            <Timeline>
              {versionHistory.map(version => (
                <TimelineEventNew
                  key={version.createdAt}
                  titleStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                  createdAtStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                  title={`Version: ${version.version}`}
                  createdAt={dayjs(version.createdAt).format('YYY-MM-DD hh:mm a')}
                  icon={<Logo style={{ width: '20px', height: '20px' }} />}
                />
              ))}
            </Timeline>
          );
        }}
      </Query>
    </>
  );
};

export default IbizaHistory;
