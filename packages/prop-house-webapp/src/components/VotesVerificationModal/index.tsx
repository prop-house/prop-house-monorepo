import classes from './VotesVerificationModal.module.css';
import Modal from 'react-modal';
import Button from '../Button';
import { ButtonColor } from '../Button';
import { SignatureState, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { openInNewTab } from '../../utils/openInNewTab';
import { BsArrowRightShort } from 'react-icons/bs';
import { MdOutlinePendingActions } from 'react-icons/md';
import { buildMyCryptoVerificationLink } from '../../utils/buildMyCryptoVerificationLink';

const VotesVerificationModal: React.FC<{
  setDisplay: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
}> = props => {
  const { proposal, setDisplay } = props;

  const decodeBase64 = (base64: string) => Buffer.from(base64, 'base64').toString('ascii');

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        isOpen={true}
        onRequestClose={() => setDisplay(false)}
        className={classes.modal}
        ariaHideApp={false}
      >
        <div className={classes.container}>
          <div className={classes.headerContainer}>
            <div className={classes.propTitle}>{proposal.title}</div>
            <div className={classes.votesSubtitle}>{`${proposal.voteCount} ${
              Number(proposal.voteCount) === 1 ? 'vote' : 'votes'
            } have been cast`}</div>
          </div>

          <div className={classes.votesContainer}>
            {proposal.votes
              .filter(v => v.signatureState !== SignatureState.FAILED_VALIDATION)
              .map((vote, index) => (
                <div key={index} className={classes.votesRow}>
                  <div className={classes.voteRowTitle}>
                    {`${vote.weight}  ${vote.weight === 1 ? 'vote' : 'votes'} ${'by'}`}
                    <EthAddress
                      address={vote.address}
                      hideDavatar={true}
                      className={classes.vRowFontSize}
                    />
                  </div>

                  {vote.signatureState === SignatureState.PENDING_VALIDATION ? (
                    <button className={classes.verifyVoteBtn} disabled={true}>
                      Pending <MdOutlinePendingActions />
                    </button>
                  ) : (
                    <button
                      className={classes.verifyVoteBtn}
                      onClick={() =>
                        openInNewTab(
                          buildMyCryptoVerificationLink(
                            Object(vote.signedData).signer,
                            decodeBase64(Object(vote.signedData).message),
                            Object(vote.signedData).signature,
                          ),
                        )
                      }
                    >
                      Verify <BsArrowRightShort />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className={classes.buttonContainer}>
          <Button text="Close" bgColor={ButtonColor.White} onClick={() => setDisplay(false)} />
        </div>
      </Modal>
    </div>
  );
};

export default VotesVerificationModal;
