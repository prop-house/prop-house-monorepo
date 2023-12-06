import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classes from './NavBar.module.css';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { isMobile } from 'web3modal';
import Button, { ButtonColor } from '../Button';
import bgColorFor, { BgColorElement } from '../../utils/bgColorFor';
import { IoSettingsSharp } from 'react-icons/io5';

const NavBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <Container className={bgColorFor(BgColorElement.Nav, location.pathname)}>
      <Navbar
        bg="transparent"
        expand="lg"
        className={clsx(classes.navbar, isMobile() && classes.mobileNavbar)}
        expanded={isNavExpanded}
      >
        <Link to="/" className={classes.logoGroup}>
          <img className={classes.bulbImg} src="/bulb.png" alt="bulb" />
        </Link>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={clsx('ms-auto', classes.navBarCollapse)}>
            <div className={classes.buttonGroup}>
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
                  accountStatus={'avatar'}
                  chainStatus={'icon'}
                />
              </Nav.Link>
              <Nav.Link>
                <Button
                  text={<IoSettingsSharp />}
                  bgColor={ButtonColor.White}
                  classNames={classes.createRoundBtn}
                  onClick={() => navigate('/dashboard')}
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
