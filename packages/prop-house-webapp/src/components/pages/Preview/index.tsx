import classes from './Preview.module.css';
import { Row, Col } from 'react-bootstrap';
import { useAppSelector } from '../../../hooks';

const Preview: React.FC<{}> = (props) => {
  const proposalEditorData = useAppSelector(state => state.editor.proposal)
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <h1>{proposalEditorData.title}</h1>
          <h2>Who is building it?</h2>
          <p>{proposalEditorData.who}</p>
          <h2>What are you building?</h2>
          <p>{proposalEditorData.what}</p>
          <h2>What timeline do you expect to complete it by?</h2>
          <p>{proposalEditorData.timeline}</p>
          <h2>Links relevant to your experience:</h2>
          <p>{proposalEditorData.links}</p>
        </Col>
      </Row>
    </>
  );
};

export default Preview;
