import classes from './ProposalFooter.module.css';

export interface ProposalFooterProps {}

const ProposalFooter: React.FC<ProposalFooterProps> = props => {
  // const {  } = props;
  // const { t } = useTranslation();

  return (
    <>
      <div className={classes.footerContainer}></div>
    </>
  );
};

export default ProposalFooter;
