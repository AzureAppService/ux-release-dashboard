import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '@reach/router';
import { ReactComponent as Logo } from '../AzureAppService.svg';

const NavBar = () => {
  return (
    <Menu fixed="top" inverted>
        <Menu.Item as={Link} to="#" link header>
          <Logo style={{ height: '50px', width: '50px' }} />
          UX Versions
        </Menu.Item>
        <Menu.Item as={Link} to="#">
          Dashboard
        </Menu.Item>
    </Menu>
  );
};
export default NavBar;
