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
const IbizaProdToRegion: { [key: string]: string } = {
  stage1: 'Central US EUAP',
  stage2: 'West Central US',
  stage3: 'South Central US',
  stage4: 'West US',
  stage5: 'World',
};
const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];

const IbizaVersionCard: FC<Props> = props => {
  const { header, items } = props;
  const onHistoryClick = (location: any) => {
    navigate(`/ibiza/history/${location}`);
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
          {items.map(item => {
            const location = IbizaProdToRegion[item.name];
            return (
              <tr key={item.name}>
                <td>{!!location ? `${item.name} (${location})` : item.name}</td>
                <td>{item.latestVersion!.version}</td>
                <td>{dayjs(item.latestVersion!.createdAt).format('MM-DD-YYYY - h:mmA')}</td>
                <td>
                  <Button primary onClick={() => onHistoryClick(item.name)}>
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
