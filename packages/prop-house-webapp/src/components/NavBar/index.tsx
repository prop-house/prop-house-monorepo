import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classes from './NavBar.module.css';
import { useAppSelector } from '../../hooks';
import defaultBrowseToAuctionId from '../../utils/defaultBrowseToAuctionId';
import Web3ModalButton from '../Web3ModalButton.tsx';

const NavBar = () => {
  const browseToAuctionId = useAppSelector((state) =>
    defaultBrowseToAuctionId(state.propHouse.auctions)
  );

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
            <Link to={`/auction/${browseToAuctionId}`} className={classes.link}>
              Browse
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
