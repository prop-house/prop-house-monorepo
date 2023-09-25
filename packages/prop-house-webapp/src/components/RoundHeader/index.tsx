import { Row, Col } from 'react-bootstrap';
import classes from './RoundHeader.module.css';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { useNavigate } from 'react-router-dom';
import ReadMore from '../ReadMore';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { isLongName } from '../../utils/isLongName';
import dayjs from 'dayjs';
import formatTime from '../../utils/formatTime';
import { House, Round, RoundType } from '@prophouse/sdk-react';
import { getDateFromTimestamp } from '../HouseManager/utils/getDateFromTimestamp';

const RoundHeader: React.FC<{
  round: Round;
  house: House;
}> = props => {
  const { round, house } = props;

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
        <div className={classes.backToAuction} onClick={() => navigate(`/${house.address}`)}>
          <img
            src={house.imageURI?.replace(/prophouse.mypinata.cloud/g, 'cloudflare-ipfs.com')}
            alt="community profile"
            className={classes.profImg}
          />
          <div className={classes.commTitle}>{house.name}</div>
        </div>

        <Col lg={12} className={classes.communityInfoCol}>
          <div className={classes.date}>
            {round.type !== RoundType.TIMED_FUNDING
              ? `${
                  dayjs().isBefore(round.config.proposalPeriodStartTimestamp) ? `Starts` : `Started`
                } ${formatTime(getDateFromTimestamp(round.config.proposalPeriodStartTimestamp))}`
              : `${formatTime(
                  getDateFromTimestamp(round.config.proposalPeriodStartTimestamp),
                )} - ${formatTime(getDateFromTimestamp(round.config.proposalPeriodEndTimestamp))}`}
          </div>
          <Col className={clsx(classes.titleRow, isLongName(house.name!) && classes.longName)}>
            <div className={classes.title}>{`${round.title}`}</div>
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
