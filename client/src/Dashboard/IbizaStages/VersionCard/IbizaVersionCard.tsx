import React, { FC } from 'react';
import './IbizaVersionCard.css';
import dayjs from 'dayjs';
import { Stage } from '../../../graphql.schema';
import { Button } from 'semantic-ui-react';
import { navigate } from '@reach/router';

interface Props {
  header: string;
  items: Stage[];
}
const IbizaProdToRegion: { [key: string]: { [key: string]: string } } = {
  public: { stage1: 'Central US EUAP', stage2: 'West Central US', stage3: 'South Central US', stage4: 'West US', stage5: 'World' },
  mooncake: {
    stage1: 'North China',
    stage2: 'Rest of China',
  },
  blackforest: {
    stage1: 'North East Germany',
    stage2: 'Rest of Germany',
  },
  fairfax: {
    stage1: 'Central US Gov',
    stage2: 'Rest of US Gov',
  },
};

const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];

const IbizaVersionCard: FC<Props> = props => {
  const { header, items } = props;
  const onHistoryClick = (location: string, cloud: string) => {
    navigate(`/ibiza/history/${cloud}/${location}`);
  };

  return (
    <div className="fxs-overview-section">
      <h1>{header || 'header'}</h1>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Version</th>
            <th>Release Date</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {items
            .sort((a: Stage, b: Stage) => {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            })
            .map(item => {
              const location = IbizaProdToRegion[item.cloud][item.name];
              return (
                <tr key={item.name}>
                  <td>{!!location ? `${item.name} (${location})` : item.name}</td>
                  <td>{item.latestVersion!.version}</td>
                  <td>{dayjs(item.latestVersion!.createdAt).format('MM-DD-YYYY - h:mmA')}</td>
                  <td>
                    <Button primary onClick={() => onHistoryClick(item.name, item.cloud)}>
                      Open
                    </Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default IbizaVersionCard;
