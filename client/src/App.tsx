import React, { FC } from 'react';
import { Menu, Container } from 'semantic-ui-react';
import Dashboard from './Dashboard/Dashboard';
import { ReactComponent as Logo } from './AzureAppService.svg';
import { Router, Link } from '@reach/router';
import FusionHistory from './FusionHistory/FusionHistory';
import IbizaHistory from './IbizaHistory/IbizaHistory';
const App: FC = () => {
  return (
    <>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item as={Link} to="#" link header>
            <Logo style={{ height: '50px', width: '50px' }} />
            UX Versions
          </Menu.Item>
          <Menu.Item as={Link} to="#">Dashboard</Menu.Item>
        </Container>
      </Menu>

      <Container style={{ marginTop: '7em' }} fluid>
        <Router>
          <Dashboard path="/"/>
          <FusionHistory path="/fusion/history/:loc" />
          <IbizaHistory path="/ibiza/history/:loc" />
        </Router>
      </Container>
    </>
  );
};

export default App;
