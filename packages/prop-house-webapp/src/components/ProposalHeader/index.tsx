import classes from './ProposalHeader.module.css';
import EthAddress from '../EthAddress';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';

export interface ProposalHeaderProps {
  fieldTitle: string;
  address: string;
  proposalId: number;
  backButton: React.ReactNode;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = props => {
  const {
    backButton,
    fieldTitle,
    address,
    proposalId,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
  } = props;

  return (
    <div className={classes.headerContainer}>
      <div className={classes.headerPropInfo}>
        {address && proposalId && (
          <div className={classes.subinfo}>
            <div className={classes.communityAndPropNumber}>
              <span className={classes.propNumber}>
                Prop {propIndex} of {numberOfProps}
              </span>{' '}
              <span className={classes.creditDash}>—</span>
              <span className={classes.propCredit}>#{proposalId} by</span>
              <div className={classes.submittedBy}>
                <EthAddress address={address} hideDavatar={true} className={classes.submittedBy} />
              </div>
            </div>
          </div>
        )}

        <p className={classes.propTitle}>{fieldTitle}</p>
      </div>

      <div className={classes.btnContainer}>
        <div className={classes.propNavigationButtons}>
          <button
            disabled={propIndex === 1}
            onClick={() => handleDirectionalArrowClick(Direction.Down)}
          >
            <ImArrowLeft2 size={'1.5rem'} />
          </button>

          <button
            onClick={() => handleDirectionalArrowClick(Direction.Up)}
            disabled={propIndex === numberOfProps}
          >
            <ImArrowRight2 size={'1.5rem'} />
          </button>
        </div>

        {backButton && backButton}
      </div>
    </div>
  );
};

export default ProposalHeader;
