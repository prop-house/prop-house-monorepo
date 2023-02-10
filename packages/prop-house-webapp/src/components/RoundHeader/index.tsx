import { Row, Col } from 'react-bootstrap';
import classes from './RoundHeader.module.css';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import formatTime from '../../utils/formatTime';
import { nameToSlug } from '../../utils/communitySlugs';
import ReadMore from '../ReadMore';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { isLongName } from '../../utils/isLongName';
import DeadlineDates from '../DeadlineDates';

const RoundHeader: React.FC<{
  community: Community;
  auction: StoredAuction;
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
          <IoArrowBackCircleOutline size={'1.5rem'} />
          <span>{community && community.name}</span>
        </div>

        <Col lg={12} className={classes.communityInfoCol}>
          <DeadlineDates round={auction} />
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
