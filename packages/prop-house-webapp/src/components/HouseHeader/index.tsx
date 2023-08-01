import classes from './HouseHeader.module.css';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { isMobile } from 'web3modal';
import ReadMore from '../ReadMore';
import { isLongName } from '../../utils/isLongName';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';

const HouseHeader: React.FC<{
  community: Community;
}> = props => {
  const { community } = props;

  const communityDescription = (
    <div className={classes.communityDescriptionRow}>
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
        {sanitizeHtml(community.description as any, {
          allowedAttributes: {
            a: ['href', 'target'],
          },
        })}
      </Markdown>
    </div>
  );

  const { t } = useTranslation();

  return (
    <div className={classes.profileHeaderRow}>
      <div className={classes.profilePicCol}>
        <CommunityProfImg community={community} />
      </div>

      <div className={classes.communityInfoCol}>
        <div className={classes.houseTitleInfo}>
          <div className={clsx(classes.titleRow, isLongName(community.name) && classes.longName)}>
            <div className={classes.title}>{community.name} House</div>
          </div>

          <div className={classes.propHouseDataRow}>
            <div className={classes.itemData}>{community.numAuctions ?? 0}</div>
            <div className={classes.itemTitle}>
              {Number(community?.numAuctions) === 1 ? t('roundCap') : t('roundsCap')}
            </div>
            <span className={classes.bullet}>{' • '}</span>

            <div className={classes.itemData}>{community.numProposals ?? 0}</div>
            <div className={classes.itemTitle}>
              {community.numProposals === 1 ? t('proposalCap') : t('proposalsCap')}
            </div>
          </div>
        </div>
        {!isMobile() && <ReadMore description={communityDescription} />}
      </div>
      {isMobile() && <ReadMore description={communityDescription} />}
    </div>
  );
};

export default HouseHeader;
