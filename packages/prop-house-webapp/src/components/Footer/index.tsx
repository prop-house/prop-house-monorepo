import classes from "./Footer.module.css";
import heartNoun from "../../assets/heart-noun.png";
import { Image } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toggleDisplayAdmin } from "../../state/slices/configuration";
import { useAppSelector } from "../../hooks";

const Footer = () => {
  const dispatch = useDispatch();
  const wsConnected = useAppSelector(
    (state) => state.propHouse.websocketConnected
  );
  return (
    <div className={classes.footerContainer}>
      <div className={classes.footer}>
        Made with{" "}
        <Image src={heartNoun} onClick={() => dispatch(toggleDisplayAdmin())} />{" "}
        (live feed {wsConnected ? "" : "dis"}connected)
      </div>
    </div>
  );
};

export default Footer;
