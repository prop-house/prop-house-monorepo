import React, { Dispatch, SetStateAction } from 'react';
import classes from './ProposalSuccessModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEthers } from '@usedapp/core';
import EthAddress from '../EthAddress';
import { openInNewTab } from '../../utils/openInNewTab';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { TimedAuction, Community } from '@nouns/prop-house-wrapper/dist/builders';

const ProposalSuccessModal: React.FC<{
  setShowProposalSuccessModal: Dispatch<SetStateAction<boolean>>;
  proposalId?: number;
  house: Community;
  round: TimedAuction;
}> = props => {
  const { setShowProposalSuccessModal, proposalId, house, round } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { account } = useEthers();
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
          {' '}
          {t(`successfulSubmission`)} <b>{round.title}</b> for <b>{house.name}</b>.
        </>
      }
      image={NounImage.Heart}
      onRequestClose={backToRound}
      button={<Button text={t('backToRound')} bgColor={ButtonColor.White} onClick={backToRound} />}
      secondButton={
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
