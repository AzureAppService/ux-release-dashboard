import React from 'react';
import IbizaVersionCard from './VersionCard/FusionVersionCard';
import { FusionLocation } from '../../graphql.schema';

const FusionLocationsCard = (props: { fusionLocations: FusionLocation[]; header: string }) => {
  return <IbizaVersionCard header={props.header} items={props.fusionLocations} />;
};

export default FusionLocationsCard;
