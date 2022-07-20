import { Row, Col } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useState } from 'react';
import CommunityProfImg from '../CommunityProfImg';
import { IoCopy } from 'react-icons/io5';
import clsx from 'clsx';
import Tooltip from '../Tooltip';
import { tempFundedBy } from '../../utils/tempFundingByFiller';
import { useTranslation } from 'react-i18next';

interface InactiveCommunity {
  contractAddress: string;
  name: string;
}

const isLongName = (name: string) => name.length > 9;

const ProfileHeader: React.FC<{
  community?: Community;
  inactiveComm?: InactiveCommunity;
}> = props => {
  const { community, inactiveComm } = props;

  const [addressTooltipCopy, setAddressTooltipCopy] = useState('Click to copy');
  const [linkTooltipCopy, setlinkTooltipCopy] = useState('Copy link');
  const { t } = useTranslation();

  return (
    <Row className={classes.profileHeaderRow}>
      <Col lg={4} className={classes.profilePicCol}>
        <CommunityProfImg community={community} />
      </Col>
      <Col>
        <Col className={classes.communityInfoCol}>
          <Col
            className={clsx(
              classes.titleRow,
              isLongName(community ? community.name : '') ||
                (isLongName(inactiveComm ? inactiveComm.name : '') && classes.longName),
            )}
          >
            <div className={classes.title}>{community ? community.name : inactiveComm?.name}</div>
            <Tooltip
              content={
                <div
                  className={classes.contractAddressPill}
                  onMouseEnter={() => setAddressTooltipCopy('Click to copy')}
                  onClick={() => {
                    setAddressTooltipCopy('Copied!');
                    navigator.clipboard.writeText(
                      community
                        ? community.contractAddress
                        : inactiveComm
                        ? inactiveComm.contractAddress
                        : '0x0000000000000000000000000000000000000000',
                    );
                  }}
                >
                  {trimEthAddress(
                    community
                      ? community.contractAddress
                      : inactiveComm
                      ? inactiveComm.contractAddress
                      : '0x0000000000000000000000000000000000000000',
                  )}
                </div>
              }
              tooltipContent={addressTooltipCopy}
            />
          </Col>
          <Col className={classes.subInfoRow}>
            <div>
              {t('fundedBy')}{' '}
              <span className={classes.funder}>
                {community ? tempFundedBy(community.contractAddress) : 'N/A'}
              </span>
            </div>
            <div className={classes.spacer}>·</div>
            <div className={classes.phLink}>
              <div>
                prop.house/
                {trimEthAddress(
                  community
                    ? community.contractAddress
                    : inactiveComm
                    ? inactiveComm.contractAddress
                    : '0x0000000000000000000000000000000000000000',
                )}
              </div>

              <Tooltip
                content={
                  <IoCopy
                    size={'1rem'}
                    className={classes.copyIcon}
                    onMouseEnter={() => setlinkTooltipCopy('copy link')}
                    onClick={() => {
                      setlinkTooltipCopy('copied!');
                      navigator.clipboard.writeText(
                        `prop.house/${
                          community
                            ? community.contractAddress
                            : inactiveComm
                            ? inactiveComm.contractAddress
                            : '0x0000000000000000000000000000000000000000'
                        }`,
                      );
                    }}
                  />
                }
                tooltipContent={linkTooltipCopy}
              />
            </div>
          </Col>
          <Col className={classes.propHouseDataRow}>
            <div className={classes.item}>
              <div className={classes.itemTitle}>{t('proposals2')}</div>
              <div className={classes.itemData}>{community ? community.numProposals : 0}</div>
            </div>
            <div className={classes.item}>
              <div className={classes.itemTitle}>{t('rounds')}</div>
              <div className={classes.itemData}>{community ? community.numAuctions : 0}</div>
            </div>
            <div className={classes.item}>
              <div className={classes.itemTitle}>{t('funded')}</div>
              <div className={classes.itemData}>{community ? community.ethFunded : 0} Ξ</div>
            </div>
          </Col>
        </Col>
      </Col>
    </Row>
  );
};

export default ProfileHeader;
