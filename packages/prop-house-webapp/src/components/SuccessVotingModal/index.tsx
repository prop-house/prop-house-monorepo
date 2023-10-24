import React, { Dispatch, SetStateAction } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppSelector } from '../../hooks';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { buildProposalPath } from '../../utils/buildPropsalPath';

const SuccessVotingModal: React.FC<{
  setShowSuccessVotingModal: Dispatch<SetStateAction<boolean>>;
  numPropsVotedFor: number;
}> = props => {
  const { setShowSuccessVotingModal, numPropsVotedFor } = props;
  const { t } = useTranslation();

  const house = useAppSelector(state => state.propHouse.onchainActiveHouse);
  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const activeProp = useAppSelector(state => state.propHouse.onchainActiveProposal);

  console.log('activeProp:', activeProp);

  const eoaSignerMsg = `${t('youveSuccessfullyVotedFor')} ${numPropsVotedFor} ${
    numPropsVotedFor === 1 ? t('prop') : t('props')
  }!`;

  const votedCopy =
    house && round
      ? activeProp
        ? `I just voted for ${activeProp.title}: ${buildProposalPath(round, activeProp.id)}`
        : `I just voted in ${house.name}'s ${round.title} round: https://prop.house${buildRoundPath(
            round,
          )}`
      : 'I just voted @ https://prop.house';

  return (
    <Modal
      setShowModal={setShowSuccessVotingModal}
      handleClose={() => setShowSuccessVotingModal(false)}
      title={t('veryNounish')}
      subtitle={eoaSignerMsg}
      image={NounImage.Glasses}
      button={
        <Button
          text={t('close')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowSuccessVotingModal(false);
          }}
        />
      }
      secondButton={
        <Button
          text={'Share on Twitter'}
          bgColor={ButtonColor.Purple}
          onClick={() => {
            openInNewTab(`https://twitter.com/intent/tweet?text=${votedCopy}`);
          }}
        />
      }
    />
  );
};

export default SuccessVotingModal;
