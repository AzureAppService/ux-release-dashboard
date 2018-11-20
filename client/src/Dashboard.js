import React from 'react';
import FusionLocations from './fusion/FusionLocations';
import IbizaStages from './ibiza/IbizaStages';

export default function Dashboard() {
  return (
    <div style={{ display: "flex", flexWrap: 'wrap' }}>
       <IbizaStages />
       <FusionLocations />
    </div>
  )
}
