import { Row, Col } from 'react-bootstrap';
import classes from './ProfileHeader.module.css';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import formatTime from '../../utils/formatTime';
import { nameToSlug } from '../../utils/communitySlugs';

const isLongName = (name: string) => name.length > 9;

interface OpenInNewTabProps {
  children: React.ReactNode;
}

// overrides an <a> tag that doesn't have target="_blank" and adds it
const OpenInNewTab = ({ children, ...props }: OpenInNewTabProps) => <a {...props}>{children}</a>;

const ProfileHeader: React.FC<{
  community?: Community;
  auction?: StoredAuction;
}> = props => {
  const { community, auction } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const isEntryPoint = !location.state;

  return (
    <Row className={classes.profileHeaderRow}>
      <Col>
        <div
          className={classes.backToAuction}
          onClick={() => {
            isEntryPoint && community ? navigate(`/${nameToSlug(community.name)}`) : navigate(-1);
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
              isLongName(community ? community.name : '') && classes.longName,
            )}
          >
            <div className={classes.title}>
              {community ? community.name : ''}
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
    </Row>
  );
};

export default ProfileHeader;
