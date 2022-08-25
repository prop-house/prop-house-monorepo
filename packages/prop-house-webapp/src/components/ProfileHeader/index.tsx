import { Row, Col } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import formatTime from '../../utils/formatTime';
import SortToggles from '../SortToggles';
import {
  // AuctionStatus,
  deadlineTime,
} from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';

interface InactiveCommunity {
  contractAddress: string;
  name: string;
}

const isLongName = (name: string) => name.length > 9;

interface OpenInNewTabProps {
  children: React.ReactNode;
}

// overrides an <a> tag that doesn't have target="_blank" and adds it
const OpenInNewTab = ({ children, ...props }: OpenInNewTabProps) => <a {...props}>{children}</a>;

const ProfileHeader: React.FC<{
  community?: Community;
  inactiveComm?: InactiveCommunity;
  auction?: StoredAuction;
}> = props => {
  const { community, inactiveComm, auction } = props;
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <Row className={classes.profileHeaderRow}>
      <Col>
        <div
          className={classes.backToAuction}
          onClick={() => {
            navigate(`/`);
          }}
        >
          <IoArrowBackCircleOutline size={'1.5rem'} />
          <span>{community && community.name}</span>
        </div>

        <Col lg={5} className={classes.communityInfoCol}>
          <div className={classes.date}>
            {auction && `${formatTime(auction.startTime)} - ${formatTime(auction.proposalEndTime)}`}
          </div>
          <Col
            className={clsx(
              classes.titleRow,
              isLongName(community ? community.name : '') ||
                (isLongName(inactiveComm ? inactiveComm.name : '') && classes.longName),
            )}
          >
            <div className={classes.title}>
              {community ? community.name : inactiveComm?.name}
              {auction && `: ${auction.title}`}
            </div>
          </Col>

          {community?.description && (
            <Col className={classes.communityDescriptionRow}>
              {/* support both markdown & html links in community's description.  */}
              <Markdown
                options={{
                  overrides: {
                    a: {
                      component: OpenInNewTab,
                      props: {
                        target: '_blank',
                        rel: 'noreferrer',
                      },
                    },
                  },
                }}
              >
                {sanitizeHtml(community?.description as any, {
                  allowedAttributes: {
                    a: ['href', 'target'],
                  },
                })}
              </Markdown>
            </Col>
          )}
        </Col>
      </Col>

      {/* utility bar */}
      <div className={classes.infoBar}>
        <div className={classes.leftSectionContainer}>
          <SortToggles auction={auction} />
        </div>

        <div className={classes.rightSectionContainer}>
          <Col className={classes.propHouseDataRow}>
            <div className={classes.item}>
              {auction ? (
                <>
                  {/* to fix */}
                  <div className={classes.itemTitle}>Deadline (to fix)</div>

                  <div className={classes.itemData}>{diffTime(deadlineTime(auction))}</div>
                </>
              ) : (
                <>
                  <div className={classes.itemTitle}>Deadline</div>
                  <div className={classes.itemData}>-</div>
                </>
              )}
            </div>

            <div className={classes.item}>
              <div className={classes.itemTitle}>{t('funding')}</div>

              <div className={classes.itemData}>
                {auction ? `${auction.fundingAmount.toFixed(2)} Ξ x ${auction.numWinners}` : '-'}
              </div>
            </div>

            <div className={classes.item}>
              <div className={classes.itemTitle}>
                {community?.numProposals === 1 ? 'Proposal' : 'Proposals'}
              </div>
              <div className={classes.itemData}>
                {community && auction ? community.numProposals : '-'}
              </div>
            </div>
          </Col>
        </div>
      </div>
    </Row>
  );
};

export default ProfileHeader;
