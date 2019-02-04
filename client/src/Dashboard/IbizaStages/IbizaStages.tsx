import React from 'react';
import IbizaVersionCard from './VersionCard/IbizaVersionCard';
import { Stage } from '../../graphql.schema';


const IbizaStages = (props: { ibizaStages: Stage[]; header: string }) => {
  return <IbizaVersionCard header={props.header} items={props.ibizaStages} />;
};

export default IbizaStages;
