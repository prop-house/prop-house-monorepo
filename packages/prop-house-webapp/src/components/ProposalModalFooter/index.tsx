import classes from './ProposalModalFooter.module.css';
import clsx from 'clsx';
import Button, { ButtonColor } from '../Button';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../hooks';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { useDispatch } from 'react-redux';
import { getNumVotes } from 'prop-house-communities';
import { setVotingPower } from '../../state/slices/voting';
import WinningProposalBanner from '../WinningProposalBanner/WinningProposalBanner';
import ProposalModalVotingModule from '../ProposalModalVotingModule';
import ProposalModalNavButtons from '../ProposalModalNavButtons';
import VotesDisplay from '../VotesDisplay';
import { useTranslation } from 'react-i18next';
import ProposalWindowButtons from '../ProposalWindowButtons';

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
  } = props;

  const { account, library } = useEthers();
  const connect = useWeb3Modal();
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
    if (!account || !library || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          library,
          round!.balanceBlockTag,
        );
        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, library, dispatch, community, round]);

  // const saveProposal = async () => {
  //   console.log('saved!');
  //   setEditProposalMode(false);
  // };
  // const cancelSavingProposal = async () => {
  //   console.log('not saved!');
  //   setEditProposalMode(false);
  // };
  // const deleteProposal = () => {
  //   console.log('deleted!');
  //   setEditProposalMode(false);
  // };

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
                    <Button
                      classNames={classes.fullWidthButton}
                      text={isVotingWindow ? 'Connect to vote' : 'Connect to submit'}
                      bgColor={ButtonColor.Purple}
                      onClick={connect}
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
                {isProposingWindow &&
                  <ProposalWindowButtons
                    proposal={proposal}
                    editProposalMode={editProposalMode}
                    setEditProposalMode={setEditProposalMode}
                  />
                }

                <>
                  {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
                  {(account && isVotingWindow) &&
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
        </div >
      )}
    </>
  );
};

export default ProposalModalFooter;
