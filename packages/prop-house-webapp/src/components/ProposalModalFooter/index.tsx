import classes from './ProposalModalFooter.module.css';
import clsx from 'clsx';
import { ButtonColor } from '../Button';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import { getNumVotes } from 'prop-house-communities';
import { setVotingPower } from '../../state/slices/voting';
import WinningProposalBanner from '../WinningProposalBanner/WinningProposalBanner';
import ProposalModalVotingModule from '../ProposalModalVotingModule';
import ProposalModalNavButtons from '../ProposalModalNavButtons';
import VotesDisplay from '../VotesDisplay';
import { useTranslation } from 'react-i18next';
import ProposalWindowButtons from '../ProposalWindowButtons';
import ConnectButton from '../ConnectButton';
import { useAccount, useProvider } from 'wagmi';

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

  const { address: account } = useAccount();
  const provider = useProvider();

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const votingPower = useAppSelector(state => state.voting.votingPower);

  const isProposingWindow = round && auctionStatus(round) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = round && auctionStatus(round) === AuctionStatus.AuctionVoting;
  const isRoundOver = round && auctionStatus(round) === AuctionStatus.AuctionEnded;

  useEffect(() => {
    if (!account || !provider || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          provider,
          round!.balanceBlockTag,
        );
        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, provider, dispatch, community, round]);

  return (
    <>
      {proposal && (
        <div className={clsx(classes.footerContainer, 'footer')}>
          <>
            {isRoundOver && isWinner ? (
              <WinningProposalBanner numOfVotes={proposal.voteCount} />
            ) : (
              <div className={classes.footerPadding}>
                {/* ACTIVE ROUND, NOT CONNECTED */}
                {!isRoundOver && !account && (
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
                )}

                {/* PROPOSING WINDOW */}
                {isProposingWindow && (
                  <ProposalWindowButtons
                    proposal={proposal}
                    editProposalMode={editProposalMode}
                    setEditProposalMode={setEditProposalMode}
                    setShowSavePropModal={setShowSavePropModal}
                    setShowDeletePropModal={setShowDeletePropModal}
                  />
                )}

                <>
                  {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
                  {account &&
                    isVotingWindow &&
                    (votingPower > 0 ? (
                      <ProposalModalVotingModule
                        proposal={proposal}
                        setShowVotingModal={setShowVotingModal}
                        setShowVoteAllotmentModal={setShowVoteAllotmentModal}
                        isWinner={isWinner && isWinner}
                      />
                    ) : (
                      // VOTING PERIOD, CONNECTED, NO VOTES
                      <>
                        <div className={classes.noVotesContainer}>
                          <p className={classes.noVotesMessage}>
                            <b>
                              {t('youDontHaveAny')} {community?.name ?? 'tokens'}{' '}
                              {t('requiredToVote')}.
                            </b>
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
                      </>
                    ))}
                </>
              </div>
            )}
          </>

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
