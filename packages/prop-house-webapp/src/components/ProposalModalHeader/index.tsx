import classes from './ProposalModalHeader.module.css';
import EthAddress from '../EthAddress';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { Direction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useCallback, useEffect, useState } from 'react';
import shareIcon from '../../assets/icons/share-icon.svg';
import Tooltip from '../Tooltip';
import { useAppSelector } from '../../hooks';
import { buildProposalPath } from '../../utils/buildPropsalPath';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'web3modal';

export interface ProposalModalHeaderProps {
  fieldTitle: string;
  address: string;
  proposalId: number;
  backButton: React.ReactNode;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
  isFirstProp: boolean;
  isLastProp: boolean | undefined;
  showVoteAllotmentModal: boolean;
  proposal: StoredProposalWithVotes;
  editProposalMode: boolean;
}

const ProposalModalHeader: React.FC<ProposalModalHeaderProps> = props => {
  const {
    backButton,
    fieldTitle,
    address,
    proposalId,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
    isFirstProp,
    isLastProp,
    showVoteAllotmentModal,
    editProposalMode,
  } = props;

  const { t } = useTranslation();
  const [tooltipContent, setTooltipContent] = useState('Click to copy');
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const propURL = community && round && buildProposalPath(community, round, proposalId);

  const shareBtn = (onClick?: () => void) => (
    <button className={classes.shareButton} onClick={onClick}>
      <img src={shareIcon} alt="share icon" />
    </button>
  );

  const mobileShare = () => {
    const shareData = {
      title: fieldTitle,
      url: propURL,
    };
    if (navigator.canShare(shareData)) navigator.share(shareData);
  };

  const shareTooltip = (
    <Tooltip
      content={
        <div
          onMouseEnter={() => setTooltipContent(t('clickToCopy'))}
          onClick={() => {
            if (!community || !round) return;
            setTooltipContent(t('copied'));
            propURL && navigator.clipboard.writeText(propURL);
          }}
        >
          {shareBtn()}
        </div>
      }
      tooltipContent={tooltipContent}
    />
  );

  const handleKeyPress = useCallback(
    event => {
      if (event.key === 'ArrowLeft' && !isFirstProp && !showVoteAllotmentModal) {
        handleDirectionalArrowClick(Direction.Down);
      }
      if (event.key === 'ArrowRight' && !isLastProp && !showVoteAllotmentModal) {
        handleDirectionalArrowClick(Direction.Up);
      }
    },
    [handleDirectionalArrowClick, isFirstProp, isLastProp, showVoteAllotmentModal],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={classes.headerContainer}>
      <div className={classes.headerPropInfo}>
        {address && proposalId && (
          <div className={classes.subinfo}>
            <div className={classes.communityAndPropNumber}>
              <span className={classes.propNumber}>
                Prop {propIndex} of {numberOfProps} <span className={classes.creditDash}>—</span> by{' '}
              </span>{' '}
              <div className={classes.submittedBy}>
                <EthAddress address={address} className={classes.submittedBy} />
              </div>
            </div>
          </div>
        )}

        <p className={classes.propTitle}>{fieldTitle}</p>
      </div>

      <div className={classes.btnContainer}>
        {isMobile() ? shareBtn(mobileShare) : shareTooltip}
        <div className={classes.propNavigationButtons}>
          <button
            disabled={isFirstProp || editProposalMode}
            onClick={() => handleDirectionalArrowClick(Direction.Down)}
          >
            <ImArrowLeft2 size={'1.5rem'} />
          </button>

          <button
            onClick={() => handleDirectionalArrowClick(Direction.Up)}
            disabled={isLastProp || editProposalMode}
          >
            <ImArrowRight2 size={'1.5rem'} />
          </button>
        </div>

        {backButton && backButton}
      </div>
    </div>
  );
};

export default ProposalModalHeader;
