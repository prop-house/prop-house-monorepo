import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalFooter.module.css';
import clsx from 'clsx';
import PropCardVotingModule from '../PropCardVotingModule';
import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { ProposalCardStatus } from '../../utils/cardStatus';
import Button, { ButtonColor } from '../Button';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import TruncateThousands from '../TruncateThousands';
import { VoteAllotment } from '../../types/VoteAllotment';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import {
  Dispatch,
  SetStateAction,
  // useRef
} from 'react';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { FaEdit as EditIcon, FaSave as SaveIcon, FaTrashAlt as TrashIcon } from 'react-icons/fa';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import Divider from '../Divider';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { isSameAddress } from '../../utils/isSameAddress';
import { ProposalFields } from '../../utils/proposalFields';
import {
  // useAppDispatch,
  useAppSelector,
} from '../../hooks';
import removeTags from '../../utils/removeTags';
// import { updateProposal } from '../../state/slices/editor';
// import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
// import { Proposal } from '@nouns/prop-house-wrapper/dist/builders';
// import {updateProposal,appendProposal,} from '../../state/slices/propHouse';

const ProposalFooter: React.FC<{
  round: StoredAuction;
  proposal: StoredProposalWithVotes;
  votingPower: number;
  votesLeftToAllot: number;
  numAllotedVotes: number;
  submittedVotes: number;
  voteAllotments: VoteAllotment[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
}> = props => {
  const {
    proposal,
    votingPower,
    votesLeftToAllot,
    numAllotedVotes,
    submittedVotes,
    voteAllotments,
    setShowVotingModal,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
    round,
    editProposalMode,
    setEditProposalMode,
  } = props;

  const { account } = useEthers();

  const isValidPropData = (data: ProposalFields) =>
    data.title.length > 4 &&
    removeTags(data.what).length > 49 &&
    data.tldr.length > 9 &&
    data.tldr.length < 121;

  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  // const dispatch = useAppDispatch();
  // const { library: provider } = useEthers();
  // const backendHost = useAppSelector(state => state.configuration.backendHost);
  // const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  const saveProposal = async () => {
    console.log('saved!');
    setEditProposalMode(false);
  };
  const deleteProposal = () => {
    console.log('deleted!');
    setEditProposalMode(false);
  };
  return (
    <>
      <div className={clsx(classes.footerContainer, 'footer')}>
        {account && votingPower > 0 && auctionStatus(round) === AuctionStatus.AuctionVoting && (
          <>
            <div className={classes.votingContainer}>
              <div className={classes.votingProgressBar}>
                <div className={classes.votingInfo}>
                  <span>Cast your votes</span>

                  <span className={classes.totalVotes}>{`${
                    votesLeftToAllot > 0
                      ? `${votingPower - submittedVotes - numAllotedVotes} left`
                      : 'no votes left'
                  }`}</span>
                </div>

                <ProgressBar
                  className={clsx(
                    classes.votingBar,
                    submittedVotes > 0 && votingPower !== submittedVotes && 'roundAllotmentBar',
                  )}
                >
                  <ProgressBar variant="success" now={(submittedVotes / votingPower) * 100} />

                  <ProgressBar
                    variant="warning"
                    now={(numAllotedVotes / votingPower) * 100}
                    key={2}
                  />
                </ProgressBar>
              </div>

              <div className={classes.voteAllotmentSection}>
                <div className={classes.icon}>
                  <VoteIcon /> <TruncateThousands amount={proposal.voteCount} /> <span>+</span>
                </div>

                <PropCardVotingModule proposal={proposal} cardStatus={ProposalCardStatus.Voting} />

                <Button
                  classNames={classes.submitVotesButton}
                  text={'Submit votes'}
                  bgColor={ButtonColor.Purple}
                  disabled={
                    voteWeightForAllottedVotes(voteAllotments) === 0 ||
                    submittedVotes === votingPower
                  }
                  onClick={() => setShowVotingModal(true)}
                />
              </div>
            </div>
            <span className={classes.footerDivider}>
              <Divider />
            </span>
          </>
        )}

        {account &&
          isSameAddress(proposal.address, account) &&
          auctionStatus(round) === AuctionStatus.AuctionAcceptingProps && (
            <div className={classes.editModeButtons}>
              {editProposalMode ? (
                <>
                  <button
                    className={classes.editProp}
                    onClick={saveProposal}
                    disabled={!isValidPropData(proposalEditorData)}
                  >
                    <span>Save</span>
                    <SaveIcon />
                  </button>

                  <button className={classes.deleteProp} onClick={deleteProposal}>
                    <span>Delete</span>
                    <TrashIcon />
                  </button>
                </>
              ) : (
                <button className={classes.editProp} onClick={() => setEditProposalMode(true)}>
                  <span>Edit</span>
                  <EditIcon />
                </button>
              )}
            </div>
          )}

        <div className={classes.btnContainer}>
          <div className={classes.propNavigationButtons}>
            <button
              disabled={propIndex === 1}
              onClick={() => handleDirectionalArrowClick(Direction.Down)}
            >
              <ImArrowLeft2 size={'1.5rem'} />
              <span>Back</span>
            </button>

            <button
              onClick={() => handleDirectionalArrowClick(Direction.Up)}
              disabled={propIndex === numberOfProps}
            >
              <span>Next</span> <ImArrowRight2 size={'1.5rem'} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalFooter;
