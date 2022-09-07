import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';
import Web3ModalButton from '../Web3ModalButton.tsx';
import clsx from 'clsx';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Navbar bg="transparent" expand="lg" className={classes.navbar}>
        <Link to="/" className={classes.logoGroup}>
          <img className={classes.bulbImg} src="bulb.png" alt="bulb" />
          <Navbar.Brand>
            <div className={classes.navbarBrand}>{t('propHouse')}</div>
            <div className={classes.poweredByNouns}>
              {t('powered')}{' '}
              <a href="https://nouns.wtf" target="_blank" rel="noreferrer">
                {t('nounsdao')}
              </a>
            </div>
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={clsx('ms-auto', classes.navBarCollapse)}>
            <Nav.Link as="div" className={classes.menuLink}>
              <Link to="/faq" className={classes.link}>
                {t('faq')}
              </Link>
              <span className={classes.divider}></span>
            </Nav.Link>
            <Nav.Link as="div" className={classes.menuLink}>
              <Link to="/learn" className={classes.link}>
                {t('learn')}
              </Link>
              <span className={classes.divider}></span>
            </Nav.Link>

            <div className={classes.buttonGroup}>
              <LocaleSwitcher />

              <Nav.Link as="div">
                <Web3ModalButton classNames={classes.link} />
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default NavBar;
