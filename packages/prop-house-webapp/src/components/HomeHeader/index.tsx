import { Col, Row, Image } from "react-bootstrap";
import Button, { ButtonColor } from "../Button";
import classes from "./HomeHeader.module.css";
import { Link } from "react-router-dom";
import grempBulb from "../../assets/gremp-lightbulb.png";
import { useAppSelector } from "../../hooks";
import defaultBrowseToAuctionId from "../../utils/defaultBrowseToAuctionId";

const HomeHeader = () => {
  const browseToAuctionId = useAppSelector((state) =>
    defaultBrowseToAuctionId(state.propHouse.auctions)
  );
  return (
    <Row className={classes.wrapper}>
      <Col lg={6} className={classes.leftCol}>
        <div className={classes.poweredByNouns}>
          Powered by{" "}
          <a href="https://nouns.wtf" target="_blank" rel="noreferrer">
            NounsDAO
          </a>
        </div>
        <h1>Weekly funding for your ideas</h1>
        <p>
          Bring your ideas to life by submitting a proposal to <b>Nouns DAO</b>.
          Funding rounds are held regularly and are available to anyone,
          anywhere.
        </p>
        <div className={classes.btnsContainer}>
          <Link to="/learn">
            <Button text="Learn more" bgColor={ButtonColor.Pink} />
          </Link>
          <Link to={`/auction/${browseToAuctionId}`}>
            <Button text="Browse rounds" bgColor={ButtonColor.White} />
          </Link>
        </div>
      </Col>
      <Col
        lg={{ span: 5, offset: 1 }}
        xl={{ span: 4, offset: 2 }}
        className={classes.rightCol}
      >
        <Image src={grempBulb} fluid />
      </Col>
    </Row>
  );
};

export default HomeHeader;
