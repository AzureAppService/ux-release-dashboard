import React, {useState} from 'react';
import { Query } from 'react-apollo';

import gql from 'graphql-tag';
import { FusionLocation, Stage } from '../graphql.schema';
import IbizaStages from './IbizaStages/IbizaStages';
import { Grid, Tab } from 'semantic-ui-react';
import FusionLocationsCard from './FusionStages/FusionLocationsCard';
import { Cat } from 'react-kawaii'

const DashboardQuery = gql`
  {
    fusionLocations {
      name
      prod
      cloud
      latestVersion {
        version
        createdAt
      }
    }
    ibizaStages {
      name
      cloud
      latestVersion {
        name
        version
        createdAt
      }
    }
  }
`;
const IbizaProdStages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'];
const reactKawaiiFaces = ['sad', 'shocked', 'happy', 'blissful', 'lovestruck', 'excited', 'ko']
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
const ProdView = (data: QueryDataType, kittyFace: number, onKittyClick: () => void, kittySize: number) => {
  return (
    <>
      <Grid stackable columns={2}>
        <Grid.Column>
          <IbizaStages header="Public Ibiza" ibizaStages={data!.ibizaStages!.filter(x => IbizaProdStages.includes(x.name) && x.cloud === 'public')} />
          <IbizaStages header="Mooncake Ibiza" ibizaStages={data!.ibizaStages!.filter(x => IbizaProdStages.includes(x.name) && x.cloud === 'mooncake')} />
          <IbizaStages header="Fairfax Ibiza" ibizaStages={data!.ibizaStages!.filter(x => IbizaProdStages.includes(x.name) && x.cloud === 'fairfax')} />
          <IbizaStages header="Blackforest Ibiza" ibizaStages={data!.ibizaStages!.filter(x => IbizaProdStages.includes(x.name) && x.cloud === 'blackforest')} />
        </Grid.Column>
        <Grid.Column>
          <FusionLocationsCard header="Fusion" fusionLocations={data!.fusionLocations!.filter(x => x.prod).sort(sortFunctionFusion)} />
          <div onClick={onKittyClick} style={{width:`${kittySize}px`, marginLeft:'auto', marginRight:'auto'}}><Cat size={kittySize} mood={reactKawaiiFaces[kittyFace]} onClick={onKittyClick} color="#596881" /></div>
        </Grid.Column>
      </Grid>
    </>
  );
};
const StageView = (data: QueryDataType, kittyFace: number, onKittyClick: () => void, kittySize: number) => {
  return (
    <>
      <Grid stackable columns={2}>
        <Grid.Column>
          <IbizaStages header="Ibiza" ibizaStages={data!.ibizaStages!.filter(x => !IbizaProdStages.includes(x.name) && x.cloud === 'public')} />
          <IbizaStages header="Mooncake Ibiza" ibizaStages={data!.ibizaStages!.filter(x => !IbizaProdStages.includes(x.name) && x.cloud === 'mooncake')} />
          <IbizaStages header="Fairfax Ibiza" ibizaStages={data!.ibizaStages!.filter(x => !IbizaProdStages.includes(x.name) && x.cloud === 'fairfax')} />
          <IbizaStages header="Blackforest Ibiza" ibizaStages={data!.ibizaStages!.filter(x => !IbizaProdStages.includes(x.name) && x.cloud === 'blackforest')} />
        </Grid.Column>
        <Grid.Column>
          <FusionLocationsCard header="Fusion" fusionLocations={data!.fusionLocations!.filter(x => !x.prod).sort(sortFunctionFusion)} />
          <div onClick={onKittyClick} style={{width:`${kittySize}px`, marginLeft:'auto', marginRight:'auto'}}><Cat size={kittySize} mood={reactKawaiiFaces[kittyFace]} onClick={onKittyClick} color="#596881" /></div>
           </Grid.Column>
      </Grid>
    </>
  );
};

const Dashboard = (props: {path:string}) => {
  const [kittyFace1, setKittyFace1] = useState(5);
  const [kittyFace2, setKittyFace2] = useState(3);
  const [kittySize, setKittySize] = useState(120);
  const changeKitty1 = () => {
    setKittyFace1((kittyFace1+1) % 7);
    setKittySize(kittySize+2);
  }
  const changeKitty2 = () => {
    setKittyFace2((kittyFace2+1) % 7);
    setKittySize(kittySize+2);
  }
  return (
    <Query<QueryDataType> query={DashboardQuery}>
      {({ loading, error, data }) => {
        if (loading) return <div className="ui active centered inline loader" />;
        if (error) return <p>Error :(</p>;
        const panes = [{ menuItem: 'Production', render: () => ProdView(data!, kittyFace1, changeKitty1, kittySize) }, { menuItem: 'Stage', render: () => StageView(data!, kittyFace2, changeKitty2,kittySize) }];
        return <Tab panes={panes} />;
      }}
    </Query>
  );
};

export default Dashboard;
