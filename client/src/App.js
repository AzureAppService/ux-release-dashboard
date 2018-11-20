import React, { Component } from "react";
import { Fabric } from "office-ui-fabric-react/lib/Fabric";
import Dashboard from "./Dashboard";
import { Router } from "@reach/router";
import FusionHistory from "./fusion/FusionHistory";
import IbizaHistory from './ibiza/IbizaHistory';

class App extends Component {
  render() {
    return (
      <Fabric>
        <Router>
          <Dashboard path="/" />
          <FusionHistory path="/fusion/history/:loc" />
          <IbizaHistory path="/ibiza/history/:loc" />
        </Router>
      </Fabric>
    );
  }
}

export default App;
