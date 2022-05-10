import { Row, Col } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useEffect } from 'react';
import { setActiveCommunity } from '../../state/slices/propHouse';
import { useAppDispatch } from '../../hooks';
import CommunityProfImg from '../CommunityProfImg';

const ProfileHeader: React.FC<{ community: Community }> = (props) => {
  const { community } = props;

  const dispatch = useAppDispatch();
  // clean up active community on dismount
  useEffect(
    () => () => {
      dispatch(setActiveCommunity(undefined));
    },
    [dispatch]
  );
  return (
    <Row className={classes.profileHeaderRow}>
      <Col xl={4} className={classes.profilePicCol}>
        <CommunityProfImg community={community} />
      </Col>
      <Col>
        <Col className={classes.communityInfoCol}>
          <Col className={classes.titleRow}>
            <div className={classes.title}>{community.name}</div>
            <div className={classes.contractAddressPill}>
              {trimEthAddress(community.contractAddress)}
            </div>
          </Col>
          <Col className={classes.subInfoRow}>
            <div>
              Funded by <span className={classes.funder}>NounsDAO</span>
            </div>
            <div className={classes.spacer}>·</div>
            <div>prop.house/{trimEthAddress(community.contractAddress)}</div>
          </Col>
          <Col className={classes.propHouseDataRow}>
            <div className={classes.item}>
              <div className={classes.itemTitle}>Proposals</div>
              <div className={classes.itemData}>{community.numProposals}</div>
            </div>
            <div className={classes.item}>
              <div className={classes.itemTitle}>Rounds</div>
              <div className={classes.itemData}>{community.numAuctions}</div>
            </div>
            <div className={classes.item}>
              <div className={classes.itemTitle}>Funded</div>
              <div className={classes.itemData}>{community.ethFunded} Ξ</div>
            </div>
          </Col>
        </Col>
      </Col>
    </Row>
  );
};

export default ProfileHeader;
