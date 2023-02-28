import classes from './NewRoundCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  deadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import { useNavigate } from 'react-router-dom';
import StatusPill from '../StatusPill';
import { nameToSlug } from '../../utils/communitySlugs';
import diffTime from '../../utils/diffTime';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';
import dayjs from 'dayjs';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveRound } from '../../state/slices/propHouse';
import TruncateThousands from '../TruncateThousands';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useEffect, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

const SimpleRoundCard: React.FC<{
  round: StoredAuction;
  displayCommunity?: boolean;
  displayTldr?: boolean;
}> = props => {
  const { round, displayCommunity, displayTldr } = props;

  const { t } = useTranslation();
  const [community, setCommunity] = useState<Community | undefined>();
  let navigate = useNavigate();
  const dispatch = useAppDispatch();
  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  interface changeTagProps {
    children: React.ReactNode;
  }

  // overrides any tag to become a <p> tag
  const changeTagToParagraph = ({ children }: changeTagProps) => <p>{children}</p>;

  // overrides any tag to become a <span> tag
  const changeTagToSpan = ({ children }: changeTagProps) => <span>{children}</span>;

  useEffect(() => {
    if (community !== undefined && displayCommunity) return;
    const fetchCommunity = async () =>
      setCommunity(await wrapper.getCommunityWithId(round.communityId));
    fetchCommunity();
  });

  return (
    <>
      <div
        onClick={e => {
          if (!community) return;
          dispatch(setActiveRound(round));
          if (cmdPlusClicked(e)) {
            openInNewTab(
              `${window.location.href}/${nameToSlug(community.name)}/${nameToSlug(round.title)}`,
            );
            return;
          }
          navigate(`../${nameToSlug(community.name)}/${nameToSlug(round.title)}`, {
            replace: true,
          });
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            auctionStatus(round) === AuctionStatus.AuctionEnded && classes.roundEnded,
            classes.roundCard,
          )}
        >
          <div className={classes.textContainer}>
            <div className={classes.topContainer}>
              <div className={classes.leftContainer}>
                <img src={community?.profileImageUrl} alt="community profile" />
                <div>{community?.name}</div>
              </div>
              <StatusPill status={auctionStatus(round)} />
            </div>
            <div className={classes.authorContainer}>{round.title}</div>

            {displayTldr && (
              //  support both markdown & html in round's description.
              <Markdown
                className={classes.truncatedTldr}
                options={{
                  overrides: {
                    h1: changeTagToParagraph,
                    h2: changeTagToParagraph,
                    h3: changeTagToParagraph,
                    a: changeTagToSpan,
                    br: changeTagToSpan,
                  },
                }}
              >
                {sanitizeHtml(round.description)}
              </Markdown>
            )}
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>{t('funding')}</p>
              <p className={classes.info}>
                <span className="">
                  <TruncateThousands amount={round.fundingAmount} decimals={2} />
                  {` ${round.currencyType}`}
                </span>
                <span className={classes.xDivide}>{' × '}</span>
                <span className="">{round.numWinners}</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <Tooltip
                content={
                  <>
                    <p className={classes.title}>{deadlineCopy(round)}</p>
                    <p className={classes.info}>
                      {diffTime(deadlineTime(round)).replace('months', 'mos')}{' '}
                    </p>
                  </>
                }
                tooltipContent={`${dayjs(deadlineTime(round))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
              />
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}> {t('proposalsCap')}</p>
              <p className={classes.info}>{round.numProposals}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SimpleRoundCard;
