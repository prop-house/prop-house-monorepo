import { StoredProposal } from "@nouns/prop-house-wrapper/dist/builders";
import proposalFields from "../../utils/proposalFields";
import RenderedProposalFields from "../RenderedProposalFields";

export interface RenderedProposalProps {
  proposal: StoredProposal;
}

const RenderedProposal: React.FC<RenderedProposalProps> = (props) => {
  const fields = proposalFields(props.proposal);
  return <RenderedProposalFields fields={fields} />;
};

export default RenderedProposal;
