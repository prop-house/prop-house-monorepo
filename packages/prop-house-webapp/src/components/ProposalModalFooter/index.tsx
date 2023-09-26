import classes from './ProposalModalFooter.module.css';
import clsx from 'clsx';
import { ButtonColor } from '../Button';
import { Dispatch, SetStateAction } from 'react';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import WinningProposalBanner from '../WinningProposalBanner/WinningProposalBanner';
import ProposalModalVotingModule from '../ProposalModalVotingModule';
import ProposalModalNavButtons from '../ProposalModalNavButtons';
import VotesDisplay from '../VotesDisplay';
import { useTranslation } from 'react-i18next';
import ProposalWindowButtons from '../ProposalWindowButtons';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import { RoundState, RoundType } from '@prophouse/sdk-react';

const ProposalModalFooter: React.FC<{
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  showVoteAllotmentModal: boolean;
  setShowVoteAllotmentModal: Dispatch<SetStateAction<boolean>>;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
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
    editProposalMode,
    setEditProposalMode,
    setShowSavePropModal,
    setShowDeletePropModal,
  } = props;

  const dispatch = useDispatch();
  const account = useAccount();
  const { t } = useTranslation();

  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const proposal = useAppSelector(state => state.propHouse.onchainActiveProposal);
  const votingPower = useAppSelector(state => state.voting.votingPower);

  const isProposingWindow = round && round.state === RoundState.IN_PROPOSING_PERIOD;
  const isVotingWindow = round && round.state === RoundState.IN_VOTING_PERIOD;
  const isRoundOver = round && round.state > RoundState.IN_VOTING_PERIOD;

  const noVotesDiv = proposal && (
    <div className={classes.noVotesContainer}>
      <p className={classes.noVotesMessage}>
        <b>Your account does not have any votes in this round.</b>
      </p>

      <div className={classes.voteCount}>
        {proposal.isWinner && (
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
        {proposal.isWinner && (
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
              round.type === RoundType.TIMED_FUNDING &&
              (isRoundOver && proposal.isWinner ? (
                <WinningProposalBanner numOfVotes={Number(proposal.votingPower)} />
              ) : !isRoundOver && !account.isConnected ? (
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
                />
              ) : (
                noVotesDiv
              ))}

            {/** INF ROUND */}
            {/* {round &&
              isInfAuction(round) &&
              (isWinner ? (
                <WinningProposalBanner numOfVotes={proposal.voteCountFor} />
              ) : !isRoundOver && account.isConnected ? (
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
              ))} */}
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
