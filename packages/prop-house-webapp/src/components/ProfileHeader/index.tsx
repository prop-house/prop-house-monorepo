import { Row, Col } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useEffect, useState } from 'react';
import { setActiveCommunity } from '../../state/slices/propHouse';
import { useAppDispatch } from '../../hooks';
import CommunityProfImg from '../CommunityProfImg';
import { IoCopy } from 'react-icons/io5';
import Tooltip from '../Tooltip';

const ProfileHeader: React.FC<{ community: Community }> = (props) => {
  const { community } = props;

  const [addressTooltipCopy, setAddressTooltipCopy] = useState('copy address');
  const [linkTooltipCopy, setlinkTooltipCopy] = useState('copy link');

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
      <Col lg={4} className={classes.profilePicCol}>
        <CommunityProfImg community={community} />
      </Col>
      <Col>
        <Col className={classes.communityInfoCol}>
          <Col className={classes.titleRow}>
            <div className={classes.title}>{community.name}</div>
            <Tooltip
              content={
                <div
                  className={classes.contractAddressPill}
                  onMouseEnter={() => setAddressTooltipCopy('copy address')}
                  onClick={() => {
                    console.log('het');
                    setAddressTooltipCopy('copied!');
                    navigator.clipboard.writeText(community.contractAddress);
                  }}
                >
                  {trimEthAddress(community.contractAddress)}
                </div>
              }
              tooltipContent={addressTooltipCopy}
            />
          </Col>
          <Col className={classes.subInfoRow}>
            <div>
              Funded by <span className={classes.funder}>NounsDAO</span>
            </div>
            <div className={classes.spacer}>·</div>
            <div>prop.house/{trimEthAddress(community.contractAddress)}</div>
            <Tooltip
              content={
                <IoCopy
                  size={'1rem'}
                  className={classes.copyIcon}
                  onMouseEnter={() => setlinkTooltipCopy('copy link')}
                  onClick={() => {
                    setlinkTooltipCopy('copied!');
                    navigator.clipboard.writeText(
                      `prop.house/${community.contractAddress}`
                    );
                  }}
                />
              }
              tooltipContent={linkTooltipCopy}
            />
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
