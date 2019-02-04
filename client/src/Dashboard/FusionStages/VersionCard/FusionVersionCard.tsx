import React, { FC } from 'react';
import './FusionVersionCard.css';
import dayjs from 'dayjs';
import { FusionLocation } from '../../../graphql.schema';
import { Button } from 'semantic-ui-react';
import { navigate } from '@reach/router';

interface Props {
  header: string;
  items: FusionLocation[];
}

const IbizaVersionCard: FC<Props> = props => {
  const { header, items } = props;
  const onHistoryClick = (location: any) => {
    navigate(`/fusion/history/${location}`);
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
            return (
              <tr key={item.name}>
                <td>{item.name}</td>
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
