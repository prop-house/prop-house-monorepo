import classes from './Learn.module.css';
import { Row, Col, Image } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import Button, { ButtonColor } from '../../Button';
import outletsImg from '../../../assets/learn page/outlets.png';
import auctionImg from '../../../assets/learn page/auction.png';
import auctionFullImg from '../../../assets/learn page/auction_full.png';
import communityImg from '../../../assets/learn page/community.png';
import clsx from 'clsx';

const Learn = () => {
  return (
    <>
      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
          <Col
            xl={{ span: 5, order: 'first' }}
            xs={{ order: 'last' }}
            className={classes.leftCol}
          >
            <Image src={outletsImg} fluid className={classes.img} />
          </Col>
          <Col
            xl={{ span: 5, offset: 1, order: 'last' }}
            xs={{ order: 'first' }}
          >
            <h2>Plug into the Nouns treasury</h2>
            <p>
              The Nouns DAO treasury has amassed $70M and counting since
              inception. Prop House aims to make it easy for anyone with an
              Ethereum address to plug in and use the treasury to build out
              their ideas.
            </p>
          </Col>
        </Row>
      </div>

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row)}>
          <Col xl={{ span: 4, offset: 1 }}>
            <h2>Bid with your ideas in Funding Auctions</h2>
            <p>
              Funding auctions are held regularly. They are auctions where the
              thing being auctioned is ETH and the bids being placed are
              proposals. Anyone is free to propose anything.
              <br />
              <br />
              At the end of each auction, members of the Nouns DAO, also known
              as Nouners, vote on which proposal will receive funding.
            </p>
          </Col>
          <Col xl={{ span: 6, offset: 1 }} className={classes.rightCol}>
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

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
          <Col
            xl={{ span: 5, order: 'first' }}
            xs={{ order: 'last' }}
            className={classes.leftCol}
          >
            <Image src={communityImg} fluid className={classes.img} />
          </Col>
          <Col
            xl={{ span: 5, offset: 1, order: 'last' }}
            xs={{ order: 'first' }}
          >
            <h2>Become part of the community</h2>
            <p>
              Nouns is a builder-first community. As a prop builder, you will
              become part of a special group of people building the future of
              open-source IP and get access to resources and support from the
              Nouns community.
            </p>
          </Col>
        </Row>
      </div>

      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.cardCTA}
      >
        <Row className={classes.flexCenter}>
          <Col xl={8}>
            <h2>This is a call to action</h2>
            <p>
              Proin tristique at lorem id molestie. Morbi elementum hendrerit
              nisi, eget luctus urna euismod in.
            </p>
          </Col>
          <Col xl={4} className={classes.flexCenter}>
            <Button text="Option A" bgColor={ButtonColor.Pink} />
            <Button text="Option B" bgColor={ButtonColor.White} />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Learn;
