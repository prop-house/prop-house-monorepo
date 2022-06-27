import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import classes from "./NavBar.module.css";
import Web3ModalButton from "../Web3ModalButton.tsx";
import clsx from "clsx";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LocaleSwitcher from "../LocaleSwitcher";

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

const NavBar = () => {
  const { t } = useTranslation();

  return (
    <Navbar bg="transparent" expand="lg" className={classes.navbar}>
      <Navbar.Brand>
        <Link to="/" className={classes.navbarBrand}>
          {t("propHouse")}
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className={clsx("ms-auto", classes.navBarCollapse)}>
          <Nav.Link as="div">
            <Link to="/learn" className={classes.link}>
              {t("learn")}
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <Link to={`/explore`} className={classes.link}>
              {t("explore")}
            </Link>
          </Nav.Link>
          <Nav.Link as="div">
            <Link to="/faq" className={classes.link}>
              {t("faq")}
            </Link>
          </Nav.Link>

          <LocaleSwitcher />

          <Nav.Link as="div">
            <Web3ModalButton classNames={classes.link} />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
