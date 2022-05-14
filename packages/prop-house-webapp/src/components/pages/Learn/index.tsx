import classes from "./Learn.module.css";
import { Row, Col, Image } from "react-bootstrap";
import Card, { CardBgColor, CardBorderRadius } from "../../Card";
import Button, { ButtonColor } from "../../Button";
import outletsImg from "../../../assets/learn page/outlets.png";
import auctionImg from "../../../assets/learn page/auction.png";
import auctionFullImg from "../../../assets/learn page/auction_full.png";
import communityImg from "../../../assets/learn page/community.png";
import clsx from "clsx";
import { useAppSelector } from "../../../hooks";
import defaultBrowseToAuctionId from "../../../utils/defaultBrowseToAuctionId";
import { useNavigate } from "react-router-dom";

const Learn = () => {
  const browseToAuctionId = useAppSelector((state) =>
    defaultBrowseToAuctionId(state.propHouse.auctions)
  );
  const navigate = useNavigate();

  return (
    <>
      <div className={clsx("break-out", classes.breakOutMobile)}>
        <Row className={clsx("g-0", classes.row, "justify-content-start")}>
          <Col
            xl={{ span: 5 }}
            xs={{ order: "first" }}
            className={classes.leftCol}
          >
            <Image src={outletsImg} fluid className={classes.img} />
          </Col>
          <Col xl={{ span: 5, offset: 1 }} xs={{ order: "last" }}>
            <h2>Plug into the Nouns treasury</h2>
            <p>
              The Nouns DAO treasury has amassed $50M+ and counting since
              inception. Prop House aims to make it easy for anyone with an
              Ethereum address to plug in and use the treasury to build out
              their ideas.
            </p>
            <Button
              text="Browse rounds"
              bgColor={ButtonColor.Pink}
              classNames={classes.firstBtn}
              onClick={() => {
                navigate(`/auction/${browseToAuctionId}`);
              }}
            />
            <a
              href="https://nouns.wtf"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: "1rem" }}
            >
              <Button text="About Nouns" bgColor={ButtonColor.White} />
            </a>
          </Col>
        </Row>
      </div>

      <div className={clsx("break-out", classes.breakOutMobile)}>
        <Row className={clsx("g-0", classes.row)}>
          <Col
            xl={{ span: 4, offset: 1, order: "first" }}
            xs={{ order: "last" }}
          >
            <Col xs={12}>
              <h2>Bid with your ideas in Funding Rounds</h2>
            </Col>
            <Col xs={12}>
              <p>
                Funding rounds are held regularly. They are auctions where the
                thing being auctioned is ETH and the bids being placed are
                proposals. Anyone is free to propose anything.
                <br />
                <br />
                At the end of each auction, members of the Nouns ecosystem vote
                on which proposal will receive funding.
              </p>
            </Col>
          </Col>
          <Col
            xl={{ span: 6, offset: 1 }}
            xs={{ order: "first" }}
            className={classes.rightCol}
          >
            <Image
              src={auctionImg}
              fluid
              className={clsx(classes.img, classes.auctionImg)}
            />
            <Image
              src={auctionFullImg}
              fluid
              className={clsx(classes.img, classes.auctionFullImg)}
            />
          </Col>
        </Row>
      </div>

      <div className={clsx("break-out", classes.breakOutMobile)}>
        <Row className={clsx("g-0", classes.row, "justify-content-start")}>
          <Col xl={5} xs={{ order: "last" }} className={classes.leftCol}>
            <Image src={communityImg} fluid className={classes.img} />
          </Col>
          <Col xl={{ span: 5, offset: 1 }} xs={{ order: "last" }}>
            <h2>Become part of the Nouns community</h2>
            <p>
              Nouns is a builder-first community. As a prop builder, you will
              become part of a special group of people building the future of
              open-source IP and get access to resources and support from the
              Nouns community.
            </p>

            <a
              href="https://discord.gg/nouns"
              target="_blank"
              rel="noreferrer"
              style={{ marginRight: "1rem" }}
            >
              <Button
                text="Go to Discord"
                bgColor={ButtonColor.Purple}
                classNames={classes.firstBtn}
              />
            </a>
            <a href="https://nouns.wtf/docs" target="_blank" rel="noreferrer">
              <Button
                text="Learn more"
                bgColor={ButtonColor.White}
                classNames={classes.firstBtn}
              />
            </a>
          </Col>
        </Row>
      </div>

      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.cardCTA}
      >
        <Row className={classes.flexCenter}>
          <Col xl={9}>
            <h2>The easiest way to get funded</h2>
            <p>All you need is an Ethereum wallet and a nounish idea.</p>
          </Col>
          <Col xl={3}>
            <Button
              text="Browse rounds"
              bgColor={ButtonColor.Pink}
              onClick={() => {
                navigate(`/auction/${browseToAuctionId}`);
              }}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Learn;
