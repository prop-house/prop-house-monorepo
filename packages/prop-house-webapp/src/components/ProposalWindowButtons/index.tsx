import classes from './ProposalWindowButtons.module.css';
import Button, { ButtonColor } from '../Button';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { isSameAddress } from '../../utils/isSameAddress';
import { clearProposal } from '../../state/slices/editor';
import { isValidPropData } from '../../utils/isValidPropData';
import { useAccount } from 'wagmi';
import { Proposal, RoundType } from '@prophouse/sdk-react';
import useVotingPower from '../../hooks/useVotingPower';

/**
 * New, Edit and Delete buttons
 */
const ProposalWindowButtons: React.FC<{
  proposal: Proposal;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
  setShowSavePropModal: (e: any) => void;
  setShowDeletePropModal: (e: any) => void;
}> = props => {
  const {
    proposal,
    editProposalMode,
    setEditProposalMode,
    setShowSavePropModal,
    setShowDeletePropModal,
  } = props;

  const { address: account } = useAccount();

  const navigate = useNavigate();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  const dispatch = useAppDispatch();

  // const [loadingCanPropose, canPropose] = useProposalGrants(round!, account);
  const [loadingVotingPower, errorLoadingVotingPower, votingPower] = useVotingPower(
    round!,
    account,
  );

  return (
    <>
      {/* MY PROP */}
      {account &&
        (isSameAddress(proposal.proposer, account) ? (
          <div className={classes.proposalWindowButtons}>
            {editProposalMode && round ? (
              <>
                <div className={classes.editModeButtons}>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Cancel'}
                    bgColor={ButtonColor.Gray}
                    onClick={() => setEditProposalMode(false)}
                  />

                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Save'}
                    bgColor={ButtonColor.Purple}
                    onClick={() => setShowSavePropModal(true)}
                    disabled={!isValidPropData(round.type === RoundType.TIMED, proposalEditorData)}
                  />
                </div>
              </>
            ) : (
              votingPower && (
                <>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={
                      loadingVotingPower ? (
                        <div>Checking for account requirements...</div>
                      ) : votingPower > 0 && !loadingVotingPower ? (
                        'Create your proposal'
                      ) : (
                        'Your account is not eligible to submit a proposal'
                      )
                    }
                    bgColor={
                      loadingVotingPower || !(votingPower > 0)
                        ? ButtonColor.Gray
                        : ButtonColor.Green
                    }
                    onClick={() => {
                      dispatch(clearProposal());
                      navigate('/create', { state: { auction: round, community, proposals } });
                    }}
                    disabled={!(votingPower > 0)}
                  />

                  <div className={classes.editModeButtons}>
                    <Button
                      classNames={classes.fullWidthButton}
                      text={'Delete'}
                      bgColor={ButtonColor.Red}
                      onClick={() => setShowDeletePropModal(true)}
                    />

                    <Button
                      classNames={classes.fullWidthButton}
                      text={'Edit Prop'}
                      bgColor={ButtonColor.Purple}
                      onClick={() => setEditProposalMode(true)}
                    />
                  </div>
                </>
              )
            )}
          </div>
        ) : (
          votingPower && (
            // NOT MY PROP
            <Button
              classNames={classes.fullWidthButton}
              text={
                loadingVotingPower ? (
                  <div>Checking for account requirements...</div>
                ) : votingPower > 0 && !loadingVotingPower ? (
                  'Create your proposal'
                ) : (
                  'Your account is not eligible to submit a proposal'
                )
              }
              bgColor={
                loadingVotingPower || !(votingPower > 0) ? ButtonColor.Gray : ButtonColor.Green
              }
              onClick={() => {
                dispatch(clearProposal());
                navigate('/create', { state: { auction: round, community, proposals } });
              }}
              disabled={!(votingPower > 0)}
            />
          )
        ))}
    </>
  );
};

export default ProposalWindowButtons;
