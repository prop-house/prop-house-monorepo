import classes from './HouseHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
// import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useState } from 'react';
import CommunityProfImg from '../CommunityProfImg';
import clsx from 'clsx';
import Tooltip from '../Tooltip';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { isMobile } from 'web3modal';
import ReadMore from '../ReadMore';
import { isLongName } from '../../utils/isLongName';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { House } from '@prophouse/sdk-react';

const HouseHeader: React.FC<{
  community: House;
}> = props => {
  const { community } = props;

  const [addressTooltipCopy, setAddressTooltipCopy] = useState('Click to copy');

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
              }
            }
          },
        }}
      >
        {sanitizeHtml(community.description ?? '', {
          allowedAttributes: {
            a: ['href', 'target'],
          },

        })}
      </Markdown>
    </div>
  );

  const { t } = useTranslation();
  const name = community.name ?? '';

  return (
    <div className={classes.profileHeaderRow}>
      <div className={classes.profilePicCol}>
        <CommunityProfImg community={community} />
      </div>

      <div className={classes.communityInfoCol}>
        <div className={classes.houseTitleInfo}>
          <div className={clsx(classes.titleRow, isLongName(name) && classes.longName)}>
            <div className={classes.title}>{name} House</div>
            {/* Not a thing anymore */}
            {/* <Tooltip
              content={
                <div
                  className={classes.contractAddressPill}
                  onMouseEnter={() => setAddressTooltipCopy(t('clickToCopy'))}
                  onClick={() => {
                    setAddressTooltipCopy(t('copied'));
                    navigator.clipboard.writeText(
                      community
                        ? community.contractAddress
                        : '0x0000000000000000000000000000000000000000',
                    );
                  }}
                >
                  {trimEthAddress(
                    community
                      ? community.contractAddress
                      : '0x0000000000000000000000000000000000000000',
                  )}{' '}
                </div>
              }
              tooltipContent={addressTooltipCopy}
            /> */}
          </div>

          <div className={classes.propHouseDataRow}>
            <div className={classes.itemData}>{community.roundCount}</div>
            <div className={classes.itemTitle}>
              {Number(community.roundCount) === 1 ? t('roundCap') : t('roundsCap')}
            </div>
            <span className={classes.bullet}>{' • '}</span>
{/* 
            <div className={classes.itemData}>{community.numProposals ?? 0}</div>
            <div className={classes.itemTitle}>
              {community.numProposals === 1 ? t('proposalCap') : t('proposalsCap')}
            </div> */}
          </div>
        </div>
        {!isMobile() && <ReadMore description={communityDescription} />}
      </div>
      {isMobile() && <ReadMore description={communityDescription} />}
    </div>
  );
};

export default HouseHeader;
