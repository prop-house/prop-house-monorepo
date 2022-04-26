import { Row, Col, Image } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';

const ProfileHeader: React.FC<{ contractAddress: string }> = (props) => {
  const { contractAddress } = props;
  return (
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
            <div className={classes.contractAddressPill}>
              {trimEthAddress(contractAddress)}
            </div>
          </Col>
          <Col className={classes.subInfoRow}>
            <div>
              Funded by <span className={classes.funder}>NounsDAO</span>
            </div>
            <div className={classes.spacer}>·</div>
            <div>prop.house/{trimEthAddress(contractAddress)}</div>
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
  );
};

export default ProfileHeader;
