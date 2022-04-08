import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { isActiveCommunity } from 'prop-house-nounish-contracts';
import FullAuction from '../../FullAuction';
import { useAppSelector } from '../../../hooks';
import { findAuctionById } from '../../../utils/findAuctionById';
import { Row, Col, Image } from 'react-bootstrap';
import classes from './Community.module.css';
import trimEthAddress from '../../../utils/trimEthAddress';

const Community = () => {
  const location = useLocation();
  const contract_address = location.pathname.substring(
    1,
    location.pathname.length
  );

  const isValidAddress =
    contract_address && ethers.utils.isAddress(contract_address);

  const auction = useAppSelector((state) =>
    findAuctionById(11, state.propHouse.auctions)
  );
  console.log(auction);

  if (!isValidAddress) return <>invalid address, please check it!</>;
  if (!isActiveCommunity(contract_address))
    return <>community does not have an active prop house yet!</>;

  return (
    <>
      <Row className={classes.profileHeaderRow}>
        <Col xl={4} className={classes.profilePicCol}>
          <Image
            src="https://lh3.googleusercontent.com/QhGhJqIP0oXQErqVvd6g5B6xGeTm8CCafZl1nhze4sYJMqyukyw928AmJ563fcCyVf2e-KMOE1Bm5QGwn0T508sth58Uw8pbJtuxIQ=w600"
            rounded={true}
            fluid
          />
        </Col>
        <Col>
          <Col className={classes.communityInfoCol}>
            <Col className={classes.titleRow}>
              <div className={classes.title}>mf'ers</div>
              <div>{trimEthAddress(contract_address)}</div>
            </Col>
            <Col className={classes.subInfoRow}>
              <div>Funded by NounsDAO</div>
              <div>prop.house/{trimEthAddress(contract_address)}</div>
            </Col>
            <Col className={classes.propHouseDataRow}>
              <div className={classes.item}>
                <div className={classes.itemTitle}>Proposals</div>
                <div className={classes.itemData}>25</div>
              </div>
              <div className={classes.item}>
                <div className={classes.itemTitle}>Rounds</div>
                <div className={classes.itemData}>25</div>
              </div>
              <div className={classes.item}>
                <div className={classes.itemTitle}>Funded</div>
                <div className={classes.itemData}>25 Ξ</div>
              </div>
            </Col>
          </Col>
        </Col>
      </Row>
      {auction && <FullAuction auction={auction} showAllProposals={true} />}
    </>
  );
};

export default Community;
