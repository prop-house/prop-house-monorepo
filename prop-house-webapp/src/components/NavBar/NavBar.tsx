import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <Navbar bg="transparent">
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
