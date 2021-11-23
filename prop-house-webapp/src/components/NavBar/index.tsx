import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';

const NavBar = () => {
  return (
    <Navbar bg="transparent" expand="lg" className={classes.navbar}>
      <Container>
        <Navbar.Brand>
          <Link to="/" className={classes.navbarBrand}>
            Prop House
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link>
              <Link to="/learn" className={classes.link}>
                Learn
              </Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/browse" className={classes.link}>
                Browse
              </Link>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
