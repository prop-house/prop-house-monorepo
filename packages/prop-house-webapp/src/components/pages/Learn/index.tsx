import classes from './Learn.module.css';
import { Row, Col, Image } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import outletsImg from '../../../assets/learn page/outlets.png';
import auctionImg from '../../../assets/learn page/auction.png';
import auctionFullImg from '../../../assets/learn page/auction_full.png';
import communityImg from '../../../assets/learn page/community.png';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import InactiveCTA from '../../InactiveCTA';

const Learn = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
          <Col
            xl={{ span: 5 }}
            xs={{ order: 'first' }}
            className={classes.leftCol}
          >
            <Image src={outletsImg} fluid className={classes.img} />
          </Col>
          <Col xl={{ span: 5, offset: 1 }} xs={{ order: 'last' }}>
            <h2>Fund nounish builders</h2>
            <p>
              NFT communities have eager members who want to build for their
              communities. Prop House makes it easy for communities to quickly
              and fairly deploy capital in order to capture the energy of their
              builders.
            </p>
            <Button
              text="Explore houses"
              bgColor={ButtonColor.Pink}
              classNames={classes.firstBtn}
              onClick={() => {
                navigate(`/explore`);
              }}
            />
          </Col>
        </Row>
      </div>

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row)}>
          <Col
            xl={{ span: 4, offset: 1, order: 'first' }}
            xs={{ order: 'last' }}
          >
            <Col xs={12}>
              <h2>Capture ideas with Funding Rounds</h2>
            </Col>
            <Col xs={12}>
              <p>
                Communities propose and vote on ideas via Funding Rounds.
                Funding rounds are auctions where the thing being auctioned is
                ETH and the bids being placed are proposals. Anyone is free to
                propose anything.
                <br />
                <br />
                At the end of each auction, members of the corresponding
                commmunity vote on which proposal will receive funding.
              </p>
            </Col>
          </Col>
          <Col
            xl={{ span: 6, offset: 1 }}
            xs={{ order: 'first' }}
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

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
          <Col xl={5} xs={{ order: 'last' }} className={classes.leftCol}>
            <Image src={communityImg} fluid className={classes.img} />
          </Col>
          <Col xl={{ span: 5, offset: 1 }} xs={{ order: 'last' }}>
            <h2>
              Bring your community together by <i>building</i> together
            </h2>
            <p>
              NFTs have enabled a new class of community. One that not only
              comes together because of shared ideas but also ones that are able
              to transact, transform and create value. Prop House is the
              permissionless ETH power source that communities gather around to
              build.
            </p>
          </Col>
        </Row>
      </div>
      <InactiveCTA />
    </>
  );
};

export default Learn;
