import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';

const NavBar = () => {
  return (
    <Navbar bg="transparent" className={classes.navbar}>
      <Container>
        <Link to="/">
          <Navbar.Brand>Prop House</Navbar.Brand>
        </Link>
        <Nav.Item>Balance 14,403 Ξ $67M</Nav.Item>
      </Container>
    </Navbar>
  );
};

export default NavBar;
