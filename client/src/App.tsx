import React, { FC } from 'react';
import {  Container } from 'semantic-ui-react';
import Dashboard from './Dashboard/Dashboard';

import { Router } from '@reach/router';
import FusionHistory from './FusionHistory/FusionHistory';
import IbizaHistory from './IbizaHistory/IbizaHistory';
import NavBar from './Components/NavBar';
const App: FC = () => {
  return (
    <>
      <NavBar />
      <Container style={{ marginTop: '7em' }} fluid>
        <Router>
          <Dashboard path="/"/>
          <FusionHistory path="/fusion/history/:loc" />
          <IbizaHistory path="/ibiza/history/:cloud/:loc" />
        </Router>
      </Container>
    </>
  );
};

export default App;
