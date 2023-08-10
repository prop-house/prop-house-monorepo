import classes from './ProposalModalFooter.module.css';
import clsx from 'clsx';
import { ButtonColor } from '../Button';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import { execStrategy } from '@prophouse/communities';
import { setVotingPower } from '../../state/slices/voting';
import WinningProposalBanner from '../WinningProposalBanner/WinningProposalBanner';
import ProposalModalVotingModule from '../ProposalModalVotingModule';
import ProposalModalNavButtons from '../ProposalModalNavButtons';
import VotesDisplay from '../VotesDisplay';
import { useTranslation } from 'react-i18next';
import ProposalWindowButtons from '../ProposalWindowButtons';
import ConnectButton from '../ConnectButton';
import { useAccount, usePublicClient } from 'wagmi';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { isActiveProp } from '../../utils/isActiveProp';

const ProposalModalFooter: React.FC<{
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  showVoteAllotmentModal: boolean;
  setShowVoteAllotmentModal: Dispatch<SetStateAction<boolean>>;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
  isWinner?: boolean;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
  setShowSavePropModal: (e: any) => void;
  setShowDeletePropModal: (e: any) => void;
}> = props => {
  const {
    setShowVotingModal,
    setShowVoteAllotmentModal,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
    isWinner,
    editProposalMode,
    setEditProposalMode,
    setShowSavePropModal,
    setShowDeletePropModal,
  } = props;

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const chainId = round && round.voteStrategy.chainId;
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const votingPower = useAppSelector(state => state.voting.votingPower);

  const publicClient = usePublicClient({
    chainId: chainId ? chainId : 1,
  });
  const { address: account } = useAccount();

  const isProposingWindow = round && auctionStatus(round) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = round && auctionStatus(round) === AuctionStatus.AuctionVoting;
  const isRoundOver = round && auctionStatus(round) === AuctionStatus.AuctionEnded;

  useEffect(() => {
    if (!account || !publicClient || !community || !round) return;

    const fetchVotes = async () => {
      try {
        const strategyPayload = {
          strategyName: round.voteStrategy.strategyName,
          account,
          publicClient,
          ...round.voteStrategy,
        };
        const votes = await execStrategy(strategyPayload);

        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, publicClient, dispatch, community, round]);

  const noVotesDiv = proposal && (
    <div className={classes.noVotesContainer}>
      <p className={classes.noVotesMessage}>
        <b>Your account does not have any votes in this round.</b>
      </p>

      <div className={classes.voteCount}>
        {isWinner && (
          <div className={classes.crownNoun}>
            <img src="/heads/crown.png" alt="crown" />
          </div>
        )}

        <div className={classes.icon}>
          <VotesDisplay proposal={proposal} />
        </div>
      </div>
    </div>
  );

  const connectDiv = proposal && (
    <div className={classes.connectContainer}>
      <ConnectButton
        classNames={classes.fullWidthButton}
        text={isVotingWindow ? t('connectToVote') : t('connectToSubmit')}
        color={ButtonColor.Purple}
      />

      <div className={classes.voteCount}>
        {isWinner && (
          <div className={classes.crownNoun}>
            <img src="/heads/crown.png" alt="crown" />
          </div>
        )}

        {!isProposingWindow && (
          <div className={classes.icon}>
            <VotesDisplay proposal={proposal} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {proposal && (
        <div className={clsx(classes.footerContainer, 'footer')}>
          <div className={classes.footerPadding}>
            {/** TIMED ROUND */}
            {round &&
              isTimedAuction(round) &&
              (isRoundOver && isWinner ? (
                <WinningProposalBanner numOfVotes={proposal.voteCountFor} />
              ) : !isRoundOver && !account ? (
                connectDiv
              ) : isProposingWindow ? (
                <ProposalWindowButtons
                  proposal={proposal}
                  editProposalMode={editProposalMode}
                  setEditProposalMode={setEditProposalMode}
                  setShowSavePropModal={setShowSavePropModal}
                  setShowDeletePropModal={setShowDeletePropModal}
                />
              ) : isVotingWindow && votingPower > 0 ? (
                <ProposalModalVotingModule
                  proposal={proposal}
                  setShowVotingModal={setShowVotingModal}
                  setShowVoteAllotmentModal={setShowVoteAllotmentModal}
                  isWinner={isWinner && isWinner}
                />
              ) : (
                noVotesDiv
              ))}

            {/** INF ROUND */}
            {round &&
              isInfAuction(round) &&
              (isWinner ? (
                <WinningProposalBanner numOfVotes={proposal.voteCountFor} />
              ) : !isRoundOver && !account ? (
                connectDiv
              ) : (
                isActiveProp(proposal, round) &&
                (votingPower === 0 ? (
                  <ProposalWindowButtons
                    proposal={proposal}
                    editProposalMode={editProposalMode}
                    setEditProposalMode={setEditProposalMode}
                    setShowSavePropModal={setShowSavePropModal}
                    setShowDeletePropModal={setShowDeletePropModal}
                  />
                ) : (
                  <ProposalModalVotingModule
                    proposal={proposal}
                    setShowVotingModal={setShowVotingModal}
                    setShowVoteAllotmentModal={setShowVoteAllotmentModal}
                    isWinner={isWinner && isWinner}
                  />
                ))
              ))}
          </div>

          <ProposalModalNavButtons
            editProposalMode={editProposalMode}
            propIndex={propIndex}
            numberOfProps={numberOfProps}
            handleDirectionalArrowClick={handleDirectionalArrowClick}
          />
        </div>
      )}
    </>
  );
};

export default ProposalModalFooter;
