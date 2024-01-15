import clsx from 'clsx';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from '../JumboRoundCard/JumboRoundCard.module.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Col, Row } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';

const JumboCardLoading = () => {
  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.twenty}
      classNames={clsx(classes.roundCard)}
      onHoverEffect={false}
    >
      <Row>
        <Col>
          <Skeleton height={30} style={{ marginBottom: '12px' }} />
          <Skeleton height={60} style={{ marginTop: 'auto' }} />
        </Col>
        <Col>
          <Skeleton height={30} style={{ marginBottom: '12px' }} />
          <Row>
            <Col>
              <Skeleton height={60} inline />
            </Col>
            <Col>
              <Skeleton height={60} inline />
            </Col>
            <Col>
              <Skeleton height={60} inline />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default JumboCardLoading;
