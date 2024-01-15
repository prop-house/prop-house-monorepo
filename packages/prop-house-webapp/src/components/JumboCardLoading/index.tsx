import clsx from 'clsx';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from '../JumboRoundCard/JumboRoundCard.module.css';
import customClasses from './JumboCardLoading.module.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Col, Row } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { isMobile } from 'web3modal';

const JumboCardLoading = () => {
  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.twenty}
      classNames={clsx(classes.roundCard, customClasses.roundCard)}
      onHoverEffect={false}
    >
      <Row>
        <Col lg={6}>
          <Skeleton height={30} style={{ marginBottom: '12px' }} />
          <Skeleton height={60} style={{ marginTop: 'auto' }} />
        </Col>
        <Col lg={6}>
          <Skeleton
            height={30}
            style={{ marginBottom: '12px', marginTop: isMobile() ? '30px' : '0px' }}
          />
          <Row>
            {Array.from(Array(3).keys()).map(i => (
              <Col>
                <Skeleton height={60} inline />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default JumboCardLoading;
