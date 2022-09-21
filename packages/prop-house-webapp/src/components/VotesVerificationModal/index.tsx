import classes from './VotesVerificationModal.module.css';
import Modal from 'react-modal';
import Button from '../Button';
import { ButtonColor } from '../Button';
import { IoMdCopy } from 'react-icons/io';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppSelector } from '../../hooks';
import { copyToClipboard } from '../../utils/copyToClipboard';

const VotesVerificationModal: React.FC<{
  setDisplay: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
}> = props => {
  const { proposal, setDisplay } = props;

  const etherscanHost = useAppSelector(state => state.configuration.etherscanHost);
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
            <div className={classes.votesSubtitle}>{`${proposal.score} ${
              Number(proposal.score) === 1 ? 'vote' : 'votes'
            } have been cast`}</div>
          </div>

          <div className={classes.votesContainer}>
            {proposal.votes.map((vote, index) => (
              <div key={index} className={classes.votesRow}>
                <div className={classes.voteRowTitle}>
                  {`${vote.weight}  ${vote.weight === 1 ? 'vote' : 'votes'} ${'by'}`}
                  <EthAddress
                    address={proposal.address}
                    hideDavatar={true}
                    className={classes.vRowFontSize}
                  />
                </div>

                <div className={classes.voteMetaBtnContainer}>
                  <button
                    className={classes.voteMetaBtn}
                    onClick={() => copyToClipboard(Object(vote.signedData).signer)}
                  >
                    Address <IoMdCopy />
                  </button>
                  <button
                    className={classes.voteMetaBtn}
                    onClick={() => copyToClipboard(decodeBase64(Object(vote.signedData).message))}
                  >
                    Message <IoMdCopy />
                  </button>
                  <button
                    className={classes.voteMetaBtn}
                    onClick={() => copyToClipboard(Object(vote.signedData).signature)}
                  >
                    Signature <IoMdCopy />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={classes.paragraphContainer}>
            <p>
              To verify each vote, you’ll need to input the address, message, and signature on
              Etherscan.
            </p>
          </div>
        </div>

        <div className={classes.buttonContainer}>
          <Button text="Close" bgColor={ButtonColor.White} onClick={() => setDisplay(false)} />
          <Button
            text="Verify →"
            bgColor={ButtonColor.Purple}
            onClick={() => openInNewTab(etherscanHost + '/verifiedSignatures')}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VotesVerificationModal;
