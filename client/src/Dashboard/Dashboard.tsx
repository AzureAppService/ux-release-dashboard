import React from 'react';
import { Query } from 'react-apollo';

import gql from 'graphql-tag';
import { FusionLocation, Stage } from '../graphql.schema';
import IbizaStages from './IbizaStages/IbizaStages';
import { Grid, Tab } from 'semantic-ui-react';
import FusionLocationsCard from './FusionStages/FusionLocationsCard';

const DashboardQuery = gql`
  {
    fusionLocations {
      name
      prod
      latestVersion {
        version
        createdAt
      }
    }
    ibizaStages {
      name
      latestVersion {
        name
        version
        createdAt
      }
    }
  }
`;
const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];

const sortFunctionFusion = (a: FusionLocation, b: FusionLocation) => {
  if (a.latestVersion!.version! < b.latestVersion!.version!) {
    return 1;
  }
  if (a.latestVersion!.version! > b.latestVersion!.version!) {
    return -1;
  }
  if (a.latestVersion!.createdAt < b.latestVersion!.createdAt) {
    return 1;
  }
  if (a.latestVersion!.createdAt > b.latestVersion!.createdAt) {
    return -1;
  }
  return 0;
};

interface QueryDataType {
  fusionLocations: FusionLocation[];
  ibizaStages: Stage[];
}
const ProdView = (data: QueryDataType) => {
  return (
    <>
      <Grid stackable columns={2}>
        <Grid.Column>
          <IbizaStages header="Ibiza" ibizaStages={data!.ibizaStages!.filter(x => IbizaProdStages.includes(x.name))} />
        </Grid.Column>
        <Grid.Column>
          <FusionLocationsCard header="Fusion" fusionLocations={data!.fusionLocations!.filter(x => x.prod).sort(sortFunctionFusion)} />
        </Grid.Column>
      </Grid>
    </>
  );
};
const StageView = (data: QueryDataType) => {
  return (
    <>
      <Grid stackable columns={2}>
        <Grid.Column>
          <IbizaStages header="Ibiza" ibizaStages={data!.ibizaStages!.filter(x => !IbizaProdStages.includes(x.name))} />
        </Grid.Column>
        <Grid.Column>
          <FusionLocationsCard header="Fusion" fusionLocations={data!.fusionLocations!.filter(x => !x.prod).sort(sortFunctionFusion)} />
        </Grid.Column>
      </Grid>
    </>
  );
};

const Dashboard = (props: {path:string}) => {
  return (
    <Query<QueryDataType> query={DashboardQuery}>
      {({ loading, error, data }) => {
        if (loading) return <div className="ui active centered inline loader" />;
        if (error) return <p>Error :(</p>;
        const panes = [{ menuItem: 'Production', render: () => ProdView(data!) }, { menuItem: 'Stage', render: () => StageView(data!) }];
        return <Tab panes={panes} />;
      }}
    </Query>
  );
};

export default Dashboard;
