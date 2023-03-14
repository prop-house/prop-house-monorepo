import { Row, Col } from 'react-bootstrap';
import classes from './RoundHeader.module.css';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { useNavigate } from 'react-router-dom';
import formatTime from '../../utils/formatTime';
import { nameToSlug } from '../../utils/communitySlugs';
import ReadMore from '../ReadMore';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { isLongName } from '../../utils/isLongName';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';

const RoundHeader: React.FC<{
  community: Community;
  auction: StoredAuctionBase;
}> = props => {
  const { community, auction } = props;
  const navigate = useNavigate();

  const roundDescription = (
    <>
      {/* support both markdown & html links in community's description.  */}
      <Markdown
        options={{
          overrides: {
            a: {
              component: ForceOpenInNewTab,
              props: {
                target: '_blank',
                rel: 'noreferrer',
              },
            },
          },
        }}
      >
        {sanitizeHtml(auction?.description as any, {
          allowedAttributes: {
            a: ['href', 'target'],
          },
        })}
      </Markdown>
    </>
  );

  return (
    <Row className={classes.profileHeaderRow}>
      <Col>
        <div
          className={classes.backToAuction}
          onClick={() => {
            community && navigate(`/${nameToSlug(community.name)}`);
          }}
        >
          {community && (
            <>
              <img
                src={community.profileImageUrl}
                alt="community profile"
                className={classes.profImg}
              />
              <div className={classes.commTitle}>{community.name}</div>
            </>
          )}
        </div>

        <Col lg={12} className={classes.communityInfoCol}>
          <div className={classes.date}>
            {isInfAuction(auction)
              ? `${dayjs().isBefore(auction.startTime) ? `Starts` : `Started`} ${formatTime(
                  auction.startTime,
                )}`
              : `${formatTime(auction.startTime)} - ${formatTime(auction.proposalEndTime)}`}
          </div>
          <Col
            className={clsx(
              classes.titleRow,
              isLongName(community ? community.name : '') && classes.longName,
            )}
          >
            <div className={classes.title}>{auction && `${auction.title}`}</div>
          </Col>

          <Col className={classes.communityDescriptionRow}>
            <ReadMore description={roundDescription} />
          </Col>
        </Col>
      </Col>
    </Row>
  );
};

export default RoundHeader;
