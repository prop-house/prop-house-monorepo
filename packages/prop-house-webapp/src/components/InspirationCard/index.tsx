import classes from './InspirationCard.module.css';
import Card from '../Card';
import { CardBgColor, CardBorderRadius } from '../Card';
import { Row, Col, Card as BSCard } from 'react-bootstrap';
import inspo1img from '../../assets/create page/inspo1.png';
import inspo2img from '../../assets/create page/inspo2.png';
import inspo3img from '../../assets/create page/inspo3.png';
import { Link } from 'react-router-dom';

interface ItemData {
  title: string;
  imgSrc: string;
  external: boolean;
  destination: string;
}

const itemCardData: ItemData[] = [
  {
    title: 'What is Nouns?',
    imgSrc: inspo1img,
    external: true,
    destination: 'https://nouns.wtf',
  },
  {
    title: 'Sample proposals',
    imgSrc: inspo2img,
    external: true,
    destination: 'https://nouns.wtf/vote',
  },
  {
    title: 'What to expect',
    external: false,
    imgSrc: inspo3img,
    destination: '/faq/',
  },
];

const itemCard = (item: ItemData) => (
  <BSCard className={classes.itemCard}>
    <BSCard.Img variant="top" src={item.imgSrc} />
    <BSCard.Body>
      <BSCard.Title>
        {item.title}
        <span className={classes.arrow}>→</span>
      </BSCard.Title>
    </BSCard.Body>
  </BSCard>
);

const InspirationCard = () => {
  const itemCards = itemCardData.map((item) => (
    <Col xl={4}>
      {item.external ? (
        <a href={item.destination} target="_blank" rel="noreferrer">
          {itemCard(item)}
        </a>
      ) : (
        <Link to={item.destination}> {itemCard(item)}</Link>
      )}
    </Col>
  ));

  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.twenty}
    >
      <Row>
        <Col xl={12} className={classes.inspoHeader}>
          <h2>Need inspiration?</h2>
          <p>
            Proposals which proliferate Nouns culture are encouraged. You can
            learn more below. Be descriptive!
          </p>
        </Col>
        {itemCards}
      </Row>
    </Card>
  );
};

export default InspirationCard;
