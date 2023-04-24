import { Row, Col } from 'react-bootstrap';
import classes from './RoundHeader.module.css';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { useNavigate } from 'react-router-dom';
import { nameToSlug } from '../../utils/communitySlugs';
import ReadMore from '../ReadMore';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { isLongName } from '../../utils/isLongName';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';
import formatTime from '../../utils/formatTime';
import { House, Round } from '@prophouse/sdk-react';

const RoundHeader: React.FC<{
  community: House;
  round: Round;
}> = props => {
  const { community, round } = props;
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
        {sanitizeHtml(round.description as any, {
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
            community && navigate(`/${community.address}`);
          }}
        >
          {community && (
            <>
              <img
                src={community.imageURI} // TODO: Support URI transform
                alt="community profile"
                className={classes.profImg}
              />
              <div className={classes.commTitle}>{community.name}</div>
            </>
          )}
        </div>

        <Col lg={12} className={classes.communityInfoCol}>
          <div className={classes.date}>
            {isInfAuction(round)
              // ? `${dayjs().isBefore(round.startTime) ? `Starts` : `Started`} ${formatTime(
              //     auction.startTime,
              //   )}`
              ? 0 // TODO: Infinite rounds not yet supports. Should use a different approach anyways
              // The conditionals everywhere are messy
              : `${formatTime(round.config.proposalPeriodStartTimestamp)} - ${formatTime(round.config.proposalPeriodEndTimestamp)}`}
          </div>
          <Col
            className={clsx(
              classes.titleRow,
              isLongName(community.name ?? '') && classes.longName,
            )}
          >
            <div className={classes.title}>{round && `${round.title}`}</div>
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
