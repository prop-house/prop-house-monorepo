import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import VotesDisplay from '../VotesDisplay';
import { useDispatch } from 'react-redux';
import { setOnchainActiveProposal, setModalActive } from '../../state/slices/propHouse';
import Divider from '../Divider';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { useEffect, useState } from 'react';
import { isMobile } from 'web3modal';
import TimedRoundVotingControls from '../TimedRoundVotingControls';
import { replaceIpfsGateway } from '../../utils/ipfs';
import { Round, Timed } from '@prophouse/sdk-react';
import { useAppSelector } from '../../hooks';
import ProposalCardClaimAwardBar from '../ProposalCardClaimAwardBar';
import { useAccount } from 'wagmi';
import { ProposalWithTldr } from '../../types/ProposalWithTldr';

const TimedRoundProposalCard: React.FC<{
  proposal: ProposalWithTldr;
  round: Round;
}> = props => {
  const { proposal, round } = props;

  const dispatch = useDispatch();
  const govPower = useAppSelector(state => state.voting.votingPower);
  const account = useAccount();

  const roundIsActive =
    round.state === Timed.RoundState.IN_PROPOSING_PERIOD ||
    round.state === Timed.RoundState.IN_VOTING_PERIOD;

  const roundEnded = round.config.votePeriodEndTimestamp < Date.now() / 1000;
  const showVoteDisplay = round.state === Timed.RoundState.IN_VOTING_PERIOD;
  const showVoteControls = showVoteDisplay && govPower > 0;

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
  const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();

  useEffect(() => {
    let imgUrl;

    const getImg = async () => {
      imgUrl = await getFirstImageFromProp(proposal);
      setImgUrlFromProp(imgUrl);
      setDisplayTldr(!isMobile() || (isMobile() && !imgUrl));
    };
    getImg();
  }, [proposal]);

  return (
    <>
      <div
        onClick={e => {
          dispatch(setModalActive(true));
          dispatch(setOnchainActiveProposal(proposal));
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(classes.proposalCard, proposal.isWinner && roundEnded && classes.winner)}
        >
          <div className={classes.propInfo}>
            <div className={classes.textContainter}>
              <div>
                <div className={classes.titleContainer}>
                  {proposal.isWinner && (
                    <div className={classes.crownNoun}>
                      <img src="/heads/crown.png" alt="crown" />
                    </div>
                  )}
                  <div className={classes.propTitle}>{proposal.title}</div>
                </div>
                {displayTldr && <div className={classes.truncatedTldr}>{proposal.tldr}</div>}
              </div>
            </div>

            {imgUrlFromProp && (
              <div className={classes.propImgContainer}>
                <img
                  src={replaceIpfsGateway(imgUrlFromProp)}
                  crossOrigin="anonymous"
                  alt="propCardImage"
                />
              </div>
            )}
          </div>

          <Divider />

          <div className={classes.submissionInfoContainer}>
            <div className={classes.addressAndTimestamp}>
              <EthAddress address={proposal.proposer} className={classes.truncate} addAvatar />

              <span className={clsx(classes.bullet, roundIsActive && classes.hideDate)}>
                {' • '}
              </span>

              <div
                className={clsx(classes.date, roundIsActive && classes.hideDate)}
                title={detailedTime(new Date(proposal.receivedAt))}
              >
                {diffTime(new Date(proposal.receivedAt * 1000))}
              </div>
            </div>
            <div className={classes.timestampAndlinkContainer}>
              <div className={clsx(classes.avatarAndPropNumber)}>
                <div
                  className={classes.voteCountCopy}
                  title={detailedTime(new Date(proposal.receivedAt))}
                >
                  {showVoteDisplay && <VotesDisplay proposal={proposal} />}

                  {showVoteControls && (
                    <div className={classes.votingArrows}>
                      <span className={classes.plusArrow}>+</span>
                      <TimedRoundVotingControls proposal={proposal} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
        {roundEnded && account.address === proposal.proposer && proposal.isWinner && (
          <ProposalCardClaimAwardBar round={round} proposal={proposal} />
        )}
      </div>
    </>
  );
};

export default TimedRoundProposalCard;
