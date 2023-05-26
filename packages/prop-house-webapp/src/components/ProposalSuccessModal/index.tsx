import React, { Dispatch, SetStateAction } from 'react';
import classes from './ProposalSuccessModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EthAddress from '../EthAddress';
import { openInNewTab } from '../../utils/openInNewTab';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { TimedAuction, Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useAccount } from 'wagmi';

const ProposalSuccessModal: React.FC<{
  setShowProposalSuccessModal: Dispatch<SetStateAction<boolean>>;
  proposalId?: number;
  house: Community;
  round: TimedAuction;
}> = props => {
  const { setShowProposalSuccessModal, proposalId, house, round } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { address: account } = useAccount();
  const twitterContent = `Check out my @NounsPropHouse prop: https://prop.house/proposal/${proposalId}`;

  const backToRound = () => {
    navigate(buildRoundPath(house, round), { replace: false });

    setShowProposalSuccessModal(false);
  };
  return (
    <Modal
      setShowModal={setShowProposalSuccessModal}
      title={
        <>
          {t('congrats')} {account && <EthAddress className={classes.address} address={account} />}!
        </>
      }
      subtitle={
        <>
          {t(`successfulSubmission`)} <b>{round.title}</b> for <b>{house.name}</b>.
        </>
      }
      image={NounImage.Heart}
      handleClose={backToRound}
      button={
        <Button
          text={'Share on Twitter'}
          bgColor={ButtonColor.Purple}
          onClick={() => {
            openInNewTab(`https://twitter.com/intent/tweet?text=${twitterContent}`);
          }}
        />
      }
    />
  );
};

export default ProposalSuccessModal;
