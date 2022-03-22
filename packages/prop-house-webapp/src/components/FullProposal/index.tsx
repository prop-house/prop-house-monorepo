import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import RenderedProposal from '../RenderedProposal';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

const FullProposal: React.FC<{
  proposal: StoredProposal;
  votingWrapper: PropHouseWrapper;
}> = (props) => {
  const { proposal } = props;

  return (
    <>
      {/* <VotingBar votingWrapper={votingWrapper} /> */}
      <RenderedProposal proposal={proposal} />
    </>
  );
};

export default FullProposal;
