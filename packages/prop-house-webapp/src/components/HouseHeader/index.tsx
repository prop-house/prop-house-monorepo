import classes from './HouseHeader.module.css';
import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { isMobile } from 'web3modal';
import ReadMore from '../ReadMore';
import { isLongName } from '../../utils/isLongName';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { House } from '@prophouse/sdk-react';
import HouseProfImg from '../HouseProfImg';

const HouseHeader: React.FC<{
  house: House;
}> = props => {
  const { house } = props;

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
        {sanitizeHtml(house.description as any, {
          allowedAttributes: {
            a: ['href', 'target'],
          },
        })}
      </Markdown>
    </div>
  );

  return (
    <div className={classes.profileHeaderRow}>
      <div className={classes.profilePicCol}>
        <HouseProfImg house={house} />
      </div>

      <div className={classes.communityInfoCol}>
        <div className={classes.houseTitleInfo}>
          <div className={clsx(classes.titleRow, isLongName(house.name ?? '') && classes.longName)}>
            <div className={classes.title}>{house.name ?? ''} House</div>
          </div>

          {/** todo: resolve for community.numProposals. removed all because # of rounds alone doesn't look good */}
          {/* <div className={classes.propHouseDataRow}>
            <div className={classes.itemData}>{house.roundCount}</div>
            <div className={classes.itemTitle}>
              {house.roundCount === 1 ? t('roundCap') : t('roundsCap')}
            </div>
            <span className={classes.bullet}>{' • '}</span>

            <div className={classes.itemData}>{community.numProposals ?? 0}</div>
            <div className={classes.itemTitle}>
              {community.numProposals === 1 ? t('proposalCap') : t('proposalsCap')}
            </div>
          </div> */}
        </div>
        {!isMobile() && <ReadMore description={communityDescription} />}
      </div>
      {isMobile() && <ReadMore description={communityDescription} />}
    </div>
  );
};

export default HouseHeader;
