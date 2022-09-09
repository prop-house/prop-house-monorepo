import classes from './Learn.module.css';
import { Row, Col, Image, Container } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import outletsImg from '../../../assets/learn page/outlets.png';
import auctionImg from '../../../assets/learn page/auction.png';
import auctionFullImg from '../../../assets/learn page/auction_full.png';
import communityImg from '../../../assets/learn page/community.png';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import ContactUsCTA from '../../ContactUsCTA';
import { useTranslation } from 'react-i18next';

const Learn = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Container>
        <div className={clsx('break-out', classes.breakOutMobile)}>
          <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
            <Col xl={{ span: 5 }} xs={{ order: 'first' }} className={classes.leftCol}>
              <Image src={outletsImg} fluid className={classes.img} />
            </Col>
            <Col xl={{ span: 5, offset: 1 }} xs={{ order: 'last' }}>
              <h2>{t('plugInto')}</h2>
              <p>{t('treasury')}</p>
              <Button
                text={'Read FAQ'}
                bgColor={ButtonColor.Pink}
                classNames={classes.firstBtn}
                onClick={() => {
                  navigate(`/faq`);
                }}
              />
            </Col>
          </Row>
        </div>

        <div className={clsx('break-out', classes.breakOutMobile)}>
          <Row className={clsx('g-0', classes.row)}>
            <Col xl={{ span: 4, offset: 1, order: 'first' }} xs={{ order: 'last' }}>
              <Col xs={12}>
                <h2>{t('fundingRoundsTitle')}</h2>
              </Col>
              <Col xs={12}>
                <p>
                  {t('fundingRounds')}
                  <br />
                  <br />
                  {t('auctionEnd')}
                </p>
              </Col>
            </Col>
            <Col xl={{ span: 6, offset: 1 }} xs={{ order: 'first' }} className={classes.rightCol}>
              <Image src={auctionImg} fluid className={clsx(classes.img, classes.auctionImg)} />
              <Image
                src={auctionFullImg}
                fluid
                className={clsx(classes.img, classes.auctionFullImg)}
              />
            </Col>
          </Row>
        </div>

        <div className={clsx('break-out', classes.breakOutMobile)}>
          <Row className={clsx('g-0', classes.row, 'justify-content-start')}>
            <Col xl={5} xs={{ order: 'last' }} className={classes.leftCol}>
              <Image src={communityImg} fluid className={classes.img} />
            </Col>
            <Col xl={{ span: 5, offset: 1 }} xs={{ order: 'last' }}>
              <h2>{t('community')}</h2>
              <p>{t('builderFirst')}</p>

              <a
                href="https://discord.gg/nouns"
                target="_blank"
                rel="noreferrer"
                style={{ marginRight: '1rem' }}
              >
                <Button
                  text={t('goToDiscord')}
                  bgColor={ButtonColor.Purple}
                  classNames={classes.firstBtn}
                />
              </a>
              <a href="https://nouns.wtf/docs" target="_blank" rel="noreferrer">
                <Button
                  text={t('learnMore')}
                  bgColor={ButtonColor.White}
                  classNames={classes.firstBtn}
                />
              </a>
            </Col>
          </Row>
        </div>
        <ContactUsCTA />
      </Container>
    </>
  );
};

export default Learn;
