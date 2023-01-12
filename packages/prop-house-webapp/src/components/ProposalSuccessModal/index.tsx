import React, { Dispatch, SetStateAction } from 'react';
import classes from './ProposalSuccessModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { nameToSlug } from '../../utils/communitySlugs';
import { useTranslation } from 'react-i18next';
import { useEthers } from '@usedapp/core';
import EthAddress from '../EthAddress';
import { openInNewTab } from '../../utils/openInNewTab';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';

const ProposalSuccessModal: React.FC<{
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  proposalId?: number;
  house: string;
  round: string;
}> = props => {
  const { showModal, setShowModal, proposalId, house, round } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { account } = useEthers();
  const twitterContent = `Check out my @NounsPropHouse prop: https://prop.house/proposal/${proposalId}`;

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      title={
        <>
          {t('congrats')} {account && <EthAddress className={classes.address} address={account} />}!
        </>
      }
      subtitle={
        <>
          {' '}
          {t(`successfulSubmission`)} <b>{round}</b> for <b>{house}</b>.
        </>
      }
      image={NounImage.Heart}
      button={
        <Button
          text={t('backToRound')}
          bgColor={ButtonColor.White}
          onClick={() => {
            navigate(`/${nameToSlug(house)}/${nameToSlug(round)}`);
            setShowModal(false);
          }}
        />
      }
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
