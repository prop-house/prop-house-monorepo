import classes from './Preview.module.css';
import { Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

const Preview: React.FC<{ title: string; body: string }> = (props) => {
  const { title, body } = props;
  return (
    <>
      <Row>
        <Col xl={12}>
          <div className={classes.titleContainer}>
            <ReactMarkdown
              className={classes.markdown}
              children={`# ${title}`}
              remarkPlugins={[remarkBreaks]}
            />
          </div>
          <ReactMarkdown
            className={classes.markdown}
            children={body}
            remarkPlugins={[remarkBreaks]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Preview;
