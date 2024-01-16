import clsx from 'clsx';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from '../JumboRoundCard/JumboRoundCard.module.css';
import customClasses from './LoadingCards.module.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Col, Container, Row } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { isMobile } from 'web3modal';

export const JumboCardLoading = () => {
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

export const RoundOrHouseHeaderLoadingCard = () => {
  return (
    <Container>
      <Row style={{ minHeight: '20rem' }}>
        <Col>
          <Col style={{ width: isMobile() ? '100%' : '50%' }}>
            <Skeleton height={30} style={{ marginBottom: '12px' }} />
            {isMobile() ? <Skeleton height={100} /> : <Skeleton height={30} />}
          </Col>
          <Col>
            {isMobile() ? (
              <Skeleton height={120} style={{ marginTop: '1rem' }} />
            ) : (
              <Skeleton height={120} />
            )}
          </Col>
        </Col>
      </Row>
    </Container>
  );
};

export const RoundOrHouseContentLoadingCard = () => {
  return (
    <div style={{ background: '#f5f5f5' }}>
      <Container>
        <Row style={{ paddingTop: '2rem' }}>
          <Col xl={8}>
            {Array(5)
              .fill(0)
              .map(() => (
                <Skeleton height={200} style={{ marginBottom: '12px' }} />
              ))}
          </Col>
          <Col>
            <Skeleton height={200} style={{ marginBottom: '12px' }} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
