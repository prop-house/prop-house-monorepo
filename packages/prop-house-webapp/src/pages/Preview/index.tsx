import { useAppSelector } from '../../hooks';
import ProposalContent from '../../components/ProposalContent';

const Preview: React.FC<{ roundCurrency?: string }> = props => {
  const proposalEditorData = useAppSelector(state => state.editor.proposal);

  return (
    <>
      <ProposalContent fields={proposalEditorData} roundCurrency={props.roundCurrency} />
    </>
  );
};

export default Preview;
