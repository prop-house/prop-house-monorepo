import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';
import Web3ModalButton from '../Web3ModalButton.tsx';
import clsx from 'clsx';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AdminTool from '../AdminTool';
import DevEnvDropDown from '../DevEnvDropdown';

const NavBar = () => {
  const { t } = useTranslation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  return (
    <Container>
      <Navbar bg="transparent" expand="lg" className={classes.navbar} expanded={isNavExpanded}>
        <Link to="/" className={classes.logoGroup}>
          <img className={classes.bulbImg} src="/bulb.png" alt="bulb" />
          <Navbar.Brand>
            <div className={classes.navbarBrand}>{t('propHouse')}</div>
            <div className={classes.poweredByNouns}>{t('publicInfra')}</div>
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={clsx('ms-auto', classes.navBarCollapse)}>
            <Nav.Link as="div" className={classes.menuLink} onClick={() => setIsNavExpanded(false)}>
              <Link to="/faq" className={classes.link}>
                {t('faq')}
              </Link>
              <span className={classes.divider}></span>
            </Nav.Link>

            <div className={classes.buttonGroup}>
              <LocaleSwitcher setIsNavExpanded={setIsNavExpanded} />

              <Nav.Link as="div">
                <Web3ModalButton classNames={classes.link} />
              </Nav.Link>

              <AdminTool>
                <DevEnvDropDown />
              </AdminTool>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default NavBar;
