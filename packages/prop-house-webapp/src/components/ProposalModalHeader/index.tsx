import classes from './ProposalModalHeader.module.css';
import EthAddress from '../EthAddress';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { useCallback, useEffect, useState } from 'react';
import shareIcon from '../../assets/icons/share-icon.svg';
import Tooltip from '../Tooltip';
import { useAppSelector } from '../../hooks';
import { buildProposalPath } from '../../utils/buildPropsalPath';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'web3modal';
import { Proposal } from '@prophouse/sdk-react';

export interface ProposalModalHeaderProps {
  backButton: React.ReactNode;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
  isFirstProp: boolean;
  isLastProp: boolean | undefined;
  showVoteAllotmentModal: boolean;
  proposal: Proposal;
  editProposalMode: boolean;
}

const ProposalModalHeader: React.FC<ProposalModalHeaderProps> = props => {
  const {
    backButton,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
    isFirstProp,
    isLastProp,
    showVoteAllotmentModal,
    editProposalMode,
    proposal,
  } = props;

  const { t } = useTranslation();
  const [tooltipContent, setTooltipContent] = useState('Click to copy');
  const round = useAppSelector(state => state.propHouse.activeRound);
  const propURL = round && buildProposalPath(round, proposal.id);

  const shareBtn = (onClick?: () => void) => (
    <button className={classes.shareButton} onClick={onClick}>
      <img src={shareIcon} alt="share icon" />
    </button>
  );

  const mobileShare = () => {
    const shareData = {
      title: proposal.title,
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
            if (!round) return;
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
        handleDirectionalArrowClick(-1);
      }
      if (event.key === 'ArrowRight' && !isLastProp && !showVoteAllotmentModal) {
        handleDirectionalArrowClick(1);
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
        <div className={classes.subinfo}>
          <div className={classes.communityAndPropNumber}>
            <span className={classes.propNumber}>
              Prop {propIndex} of {numberOfProps}
            </span>
          </div>
        </div>

        <p className={classes.propTitle}>{proposal.title}</p>

        <div className={classes.authorAndFundReqContainer}>
          <div className={classes.submittedBy}>
            <EthAddress address={proposal.proposer} className={classes.submittedBy} />
          </div>
        </div>
      </div>

      <div className={classes.btnContainer}>
        {isMobile() ? shareBtn(mobileShare) : shareTooltip}
        <div className={classes.propNavigationButtons}>
          <button
            disabled={isFirstProp || editProposalMode}
            onClick={() => handleDirectionalArrowClick(-1)}
          >
            <ImArrowLeft2 size={'1.5rem'} />
          </button>

          <button
            onClick={() => handleDirectionalArrowClick(1)}
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
