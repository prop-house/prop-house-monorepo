import { Row, Col } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import classes from './VotesLeft.module.css';

const VotesLeft: React.FC<{
  numVotesLeft: number;
}> = (props) => {
  const { numVotesLeft } = props;
  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <Row>
        <Col>
          <div className={classes.votesCopy}>
            {`Votes left: ${numVotesLeft}`}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default VotesLeft;
