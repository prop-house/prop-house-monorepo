import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import classes from "./NavBar.module.css";
import { useEthers } from "@usedapp/core";
import EthAddress from "../EthAddress";
import { useEffect } from "react";

const NavBar = () => {
  const { activateBrowserWallet, account } = useEthers();

  useEffect(() => {
    console.log(account)

  }, [account])

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
            <Link to="/browse" className={classes.link}>
              Browse
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <div>
              {account ? (
                <p>
                  Account: <EthAddress>{account}</EthAddress>
                </p>
              ) : (
                <div>
                  <span
                    className={classes.link}
                    onClick={() => activateBrowserWallet()}
                  >
                    Connect Wallet
                  </span>
                </div>
              )}
            </div>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
