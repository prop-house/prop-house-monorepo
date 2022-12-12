import classes from './ProposalHeaderAndBody.module.css';
import ProposalContent from '../ProposalContent';
import proposalFields, { ProposalFields } from '../../utils/proposalFields';
import { IoClose } from 'react-icons/io5';
import { Col, Container } from 'react-bootstrap';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../OpenGraphElements';
import ProposalModalHeader from '../ProposalModalHeader';
import Divider from '../Divider';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ScrollButton from '../ScrollButton/ScrollButton';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ProposalEditor from '../ProposalEditor';
import WinningProposalBanner from '../WinningProposalBanner/WinningProposalBanner';
import { patchProposal } from '../../state/slices/editor';

interface ProposalHeaderAndBodyProps {
  currentProposal: StoredProposalWithVotes;
  currentPropIndex: number;
  handleDirectionalArrowClick: any;
  handleClosePropModal: () => void;
  isWinner?: boolean;
  hideScrollButton: boolean;
  setHideScrollButton: Dispatch<SetStateAction<boolean>>;
  showVoteAllotmentModal: boolean;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
}

const ProposalHeaderAndBody: React.FC<ProposalHeaderAndBodyProps> = (
  props: ProposalHeaderAndBodyProps,
) => {
  const {
    currentProposal,
    currentPropIndex,
    handleDirectionalArrowClick,
    handleClosePropModal,
    isWinner,
    hideScrollButton,
    setHideScrollButton,
    showVoteAllotmentModal,
    editProposalMode,
    setEditProposalMode,
  } = props;

  const dispatch = useAppDispatch();

  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const isFirstProp = currentPropIndex === 1;
  const isLastProp = proposals && currentPropIndex === proposals.length;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [toggleScrollButton, setToggleScrollButton] = useState(false);

  useEffect(() => {
    toggleScrollButton && bottomRef && bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    setToggleScrollButton(false);
  }, [toggleScrollButton]);

  useEffect(() => {
    setHideScrollButton(false);
    if (
      document.querySelector('#propModal')!.getBoundingClientRect().height >
      document.querySelector('#propContainer')!.getBoundingClientRect().height
    ) {
      setHideScrollButton(true);
    }
    // watch for proposal change to reset scroll button
  }, [proposal, setHideScrollButton]);

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
  };

  return (
    <>
      <Container>
        {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.tldr}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )}

        {proposals && (
          <div id="propContainer" className={classes.propContainer}>
            <Col xl={12} className={classes.propCol}>
              <div className={classes.stickyContainer}>
                <ProposalModalHeader
                  backButton={
                    <div
                      className={classes.backToAuction}
                      onClick={() => {
                        setEditProposalMode(false);
                        handleClosePropModal();
                      }}
                    >
                      <IoClose size={'1.5rem'} />
                    </div>
                  }
                  fieldTitle={proposalFields(currentProposal).title}
                  address={currentProposal.address}
                  proposalId={currentProposal.id}
                  propIndex={currentPropIndex}
                  numberOfProps={proposals.length}
                  handleDirectionalArrowClick={handleDirectionalArrowClick}
                  isFirstProp={isFirstProp}
                  isLastProp={isLastProp && isLastProp}
                  showVoteAllotmentModal={showVoteAllotmentModal}
                  proposal={currentProposal}
                  editProposalMode={editProposalMode}
                />

                <Divider />
              </div>

              {isWinner && <WinningProposalBanner numOfVotes={currentProposal.voteCount} />}

              {!hideScrollButton && !editProposalMode && (
                <div className="scrollMoreContainer">
                  <ScrollButton
                    toggleScrollButton={toggleScrollButton}
                    setHideScrollButton={setHideScrollButton}
                    setToggleScrollButton={setToggleScrollButton}
                  />
                </div>
              )}

              {editProposalMode ? (
                <ProposalEditor
                  fields={proposalFields(currentProposal)}
                  onDataChange={onDataChange}
                />
              ) : (
                <ProposalContent fields={proposalFields(currentProposal)} />
              )}

              <div ref={bottomRef} />
            </Col>
          </div>
        )}
      </Container>
    </>
  );
};

export default ProposalHeaderAndBody;
