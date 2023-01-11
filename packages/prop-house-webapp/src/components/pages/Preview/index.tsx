import { useAppSelector } from '../../../hooks';
import ProposalContent from '../../ProposalContent';

const Preview: React.FC<{}> = props => {
  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  return (
    <>
      <ProposalContent fields={proposalEditorData} />
    </>
  );
};

export default Preview;
