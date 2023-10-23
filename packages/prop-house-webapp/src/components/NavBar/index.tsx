import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import classes from './NavBar.module.css';
import clsx from 'clsx';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { isMobile } from 'web3modal';
import Button, { ButtonColor } from '../Button';

const NavBar = () => {
  const { t } = useTranslation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <Container>
      <Navbar bg="transparent" expand="lg" className={classes.navbar} expanded={isNavExpanded}>
        <Link to="/" className={classes.logoGroup}>
          <img className={classes.bulbImg} src="/bulb.png" alt="bulb" />
          <Navbar.Brand>
            {!isMobile() && (
              <>
                <div className={classes.navbarBrand}>{t('propHouse')}</div>
              </>
            )}
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

              <Nav.Link as="div" className={classes.connectBtnContainer}>
                <Button
                  text="Create a round"
                  bgColor={ButtonColor.Purple}
                  onClick={() => navigate('/create-round')}
                  classNames={classes.createRoundBtn}
                />
              </Nav.Link>

              <Nav.Link as="div" className={classes.connectBtnContainer}>
                <ConnectButton
                  showBalance={false}
                  label={'Connect'}
                  accountStatus={'full'}
                  chainStatus={'icon'}
                />
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default NavBar;
