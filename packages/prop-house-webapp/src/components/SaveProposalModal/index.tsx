import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { NounImage } from '../../utils/getNounImage';
import Modal from '../Modal';
import { usePropHouse } from '@prophouse/sdk-react';
import { useAccount } from 'wagmi';
import LoadingIndicator from '../LoadingIndicator';
import { useDispatch } from 'react-redux';
import { setOnChainActiveProposals } from '../../state/slices/propHouse';

const SaveProposalModal: React.FC<{
  propId: number;
  setShowSavePropModal: Dispatch<SetStateAction<boolean>>;
  setEditProposalMode: (e: any) => void;
}> = props => {
  const { propId, setShowSavePropModal, setEditProposalMode } = props;

  const propHouse = usePropHouse();
  const { address: account } = useAccount();
  const updatedProposal = useAppSelector(state => state.editor.proposal);
  const host = useAppSelector(state => state.configuration.backendHost);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const client = useRef(new PropHouseWrapper(host));
  const dispatch = useDispatch();

  const [propSubmitted, setPropSubmitted] = useState(false);
  const [errorSubmittingProp, setErrorSubmittingProp] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitProposal = async () => {
    if (!round || !account || !proposals || !proposal) return;

    const { title, what, tldr } = updatedProposal;

    try {
      setLoading(true);
      const json = JSON.stringify({ title, what, tldr }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const file = new File([blob], 'proposal.json', { type: 'application/json' });

      const result = await client.current.postFile(file, file.name);
      await propHouse.round.timed.editProposalViaSignature({
        round: round.address,
        proposalId: proposal.id,
        metadataUri: `ipfs://${result.data.ipfsHash}`,
      });

      const updatedProp = {
        ...proposal,
        metadataURI: `ipfs://${result.data.ipfsHash}`,
        title,
        body: what,
      };

      const updatedProposals = proposals.map(proposal =>
        proposal.id === updatedProp.id ? updatedProp : proposal,
      );

      dispatch(setOnChainActiveProposals([...updatedProposals]));
      setLoading(false);
      setPropSubmitted(true);
    } catch (e) {
      setLoading(false);
      setPropSubmitted(false);
      setErrorSubmittingProp(true);
      console.log(`Error submitting proposal: `, e);
    }
  };

  const handleClose = () => {
    setShowSavePropModal(false);
    if (propSubmitted && round) setEditProposalMode(false);
  };

  return (
    <Modal
      modalProps={{
        title: loading
          ? 'Submitting'
          : errorSubmittingProp
          ? 'Error Saving'
          : propSubmitted
          ? 'Saved Successfully!'
          : 'Save this version?',
        subtitle: loading ? (
          'Sending it through the ether...'
        ) : errorSubmittingProp ? (
          'Your proposal could not be saved. Please try again.'
        ) : propSubmitted ? (
          <>
            Proposal <b>#{propId}</b> has been updated.
          </>
        ) : (
          'By confirming, these changes will be saved and your proposal will be updated.'
        ),
        image: errorSubmittingProp ? NounImage.Laptop : propSubmitted ? NounImage.Thumbsup : null,
        setShowModal: setShowSavePropModal,
        handleClose: handleClose,
        body: loading && <LoadingIndicator />,
        button: loading
          ? null
          : !propSubmitted && (
              <Button
                text={errorSubmittingProp ? 'Retry' : 'Save Prop'}
                bgColor={ButtonColor.Purple}
                onClick={submitProposal}
              />
            ),
      }}
    />
  );
};

export default SaveProposalModal;
