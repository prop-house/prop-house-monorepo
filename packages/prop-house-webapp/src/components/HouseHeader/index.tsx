import classes from './HouseHeader.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useState } from 'react';
import CommunityProfImg from '../CommunityProfImg';
import clsx from 'clsx';
import Tooltip from '../Tooltip';
import { useTranslation } from 'react-i18next';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { isMobile } from 'web3modal';
import ReadMore from '../ReadMore';

const isLongName = (name: string) => name.length > 9;

interface OpenInNewTabProps {
  children: React.ReactNode;
}

// overrides an <a> tag that doesn't have target="_blank" and adds it
const OpenInNewTab = ({ children, ...props }: OpenInNewTabProps) => <a {...props}>{children}</a>;
const RemoveBreak = ({ children }: OpenInNewTabProps) => <>{children}</>;

const HouseHeader: React.FC<{
  community: Community;
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
              component: OpenInNewTab,
              props: {
                target: '_blank',
                rel: 'noreferrer',
              },
            },
            br: {
              component: RemoveBreak,
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
            <Tooltip
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
            />
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
