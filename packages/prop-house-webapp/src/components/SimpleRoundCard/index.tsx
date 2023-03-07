import classes from './SimpleRoundCard.module.css';
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
import { useEffect, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAccount, useSigner } from 'wagmi';
import { InfuraProvider } from '@ethersproject/providers';
import { getNumVotes } from 'prop-house-communities';

const SimpleRoundCard: React.FC<{
  round: StoredAuction;
  displayCommunity?: boolean;
}> = props => {
  const { round, displayCommunity } = props;

  const { t } = useTranslation();

  const [community, setCommunity] = useState<Community | undefined>();
  const [numVotesCasted, setNumVotesCasted] = useState<number | null>(null);
  const [votingPower, setVotingPower] = useState<number | null>(null);
  const [statusCopy, setStatusCopy] = useState('...');

  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  const { address: account } = useAccount();
  const { data: signer } = useSigner();

  // fetch num votes casted
  useEffect(() => {
    if (auctionStatus(round) === AuctionStatus.AuctionVoting && account) {
      const fetchNumVotesCasted = async () => {
        try {
          const numVotes = await wrapper.getNumVotesCastedForRound(account, round.id);
          setNumVotesCasted(numVotes);
        } catch (e) {
          console.log(e);
        }
      };

      fetchNumVotesCasted();
    }
  });

  // fetch voting power for user
  useEffect(() => {
    if (!account || !signer || !community) return;

    const fetchVotes = async () => {
      try {
        const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          provider,
          round.balanceBlockTag,
        );
        setVotingPower(votes);
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, signer, community, round.balanceBlockTag]);

  // fetch community
  useEffect(() => {
    if (community !== undefined || displayCommunity) return;

    const fetchCommunity = async () =>
      setCommunity(await wrapper.getCommunityWithId(round.communityId));
    fetchCommunity();
  });

  // voting status copy
  useEffect(() => {
    if (votingPower === null || numVotesCasted === null) return;
    if (numVotesCasted === 0) {
      setStatusCopy(`You haven't voted yet!`);
    } else if (numVotesCasted === votingPower) {
      setStatusCopy(`You casted all your ${votingPower} votes!`);
    } else {
      setStatusCopy(`You casted ${numVotesCasted} of ${votingPower} votes`);
    }
  }, [votingPower, numVotesCasted]);

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
          navigate(`../${nameToSlug(community.name)}/${nameToSlug(round.title)}`);
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

          <div
            className={clsx(
              classes.statusRow,
              auctionStatus(round) === AuctionStatus.AuctionVoting
                ? classes.voting
                : classes.proposing,
            )}
          >
            {statusCopy}
          </div>
        </Card>
      </div>
    </>
  );
};

export default SimpleRoundCard;
