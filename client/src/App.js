import React, { Component } from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import FusionLocations from "./fusion/FusionLocations";
import IbizaStages from "./ibiza/IbizaStages";

class App extends Component {
  render() {
    return (
      <Fabric>
        <IbizaStages />
        <FusionLocations />
      </Fabric>
    );
  }
}

export default App;
