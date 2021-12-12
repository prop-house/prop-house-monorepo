import classes from './Preview.module.css';
import { Row, Col } from 'react-bootstrap';
import { PropData } from '../Create';

const Preview: React.FC<{ propData: PropData }> = (props) => {
  const { propData } = props;
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <h1>{propData.title}</h1>
          <h2>Who is building it?</h2>
          <p>{propData.who}</p>
          <h2>What are you building?</h2>
          <p>{propData.what}</p>
          <h2>What timeline do you expect to complete it by?</h2>
          <p>{propData.timeline}</p>
          <h2>Links relevant to your experience:</h2>
          <p>{propData.links}</p>
        </Col>
      </Row>
    </>
  );
};

export default Preview;
