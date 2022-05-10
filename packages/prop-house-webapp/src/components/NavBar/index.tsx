import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';
import Web3ModalButton from '../Web3ModalButton.tsx';

const NavBar = () => {
  return (
    <Navbar bg="transparent" expand="lg" className={classes.navbar}>
      <Navbar.Brand>
        <Link to="/" className={classes.navbarBrand}>
          Prop House
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as="div">
            <Link to="/learn" className={classes.link}>
              Learn
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <Link to={`/explore`} className={classes.link}>
              Explore
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <Link to="/faq" className={classes.link}>
              FAQ
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <Web3ModalButton classNames={classes.link} />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
