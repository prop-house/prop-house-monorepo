import classes from './ProposalHeaderAndBody.module.css';
import ProposalContent from '../../ProposalContent';
import proposalFields from '../../../utils/proposalFields';
import { IoClose } from 'react-icons/io5';
import { Col, Container } from 'react-bootstrap';
import { cardServiceUrl, CardType } from '../../../utils/cardServiceUrl';
import OpenGraphElements from '../../OpenGraphElements';
import ProposalHeader from '../../ProposalHeader';
import Divider from '../../Divider';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

interface ProposalHeaderAndBodyProps {
  proposal: StoredProposalWithVotes;
  proposals: StoredProposalWithVotes[];
  currentProposal: StoredProposalWithVotes;
  currentPropIndex: number;
  handleDirectionalArrowClick: any;
  handleClosePropModal: any;
}

const ProposalHeaderAndBody: React.FC<ProposalHeaderAndBodyProps> = (
  props: ProposalHeaderAndBodyProps,
) => {
  const {
    proposals,
    proposal,
    currentProposal,
    currentPropIndex,
    handleDirectionalArrowClick,
    handleClosePropModal,
  } = props;
  return (
    <>
      <Container>
        {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.tldr}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )}

        <div className={classes.propContainer}>
          <Col xl={12} className={classes.propCol}>
            <div className={classes.stickyContainer}>
              <ProposalHeader
                backButton={
                  <div className={classes.backToAuction} onClick={() => handleClosePropModal()}>
                    <IoClose size={'1.5rem'} />
                  </div>
                }
                fieldTitle={proposalFields(currentProposal).title}
                address={currentProposal.address}
                proposalId={currentProposal.id}
                propIndex={currentPropIndex}
                numberOfProps={proposals.length}
                handleDirectionalArrowClick={handleDirectionalArrowClick}
              />

              <Divider />
            </div>

            <ProposalContent fields={proposalFields(currentProposal)} />
          </Col>
        </div>
      </Container>
    </>
  );
};

export default ProposalHeaderAndBody;
