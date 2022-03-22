import { useAppSelector } from '../../../hooks';
import RenderedProposalFields from '../../RenderedProposalFields';

const Preview: React.FC<{}> = (props) => {
  const proposalEditorData = useAppSelector((state) => state.editor.proposal);
  return (
    <>
      <RenderedProposalFields fields={proposalEditorData} />
    </>
  );
};

export default Preview;
