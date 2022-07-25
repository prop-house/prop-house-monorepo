import classes from "./InspirationCard.module.css";
import Card from "../Card";
import { CardBgColor, CardBorderRadius } from "../Card";
import { Row, Col, Card as BSCard } from "react-bootstrap";
import inspo1img from "../../assets/create page/inspo1.png";
import inspo2img from "../../assets/create page/inspo2.png";
import inspo3img from "../../assets/create page/inspo3.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ItemData {
  title: string;
  imgSrc: string;
  external: boolean;
  destination: string;
}

const itemCardData: ItemData[] = [
  {
    title: "whatIsNouns",
    imgSrc: inspo1img,
    external: true,
    destination: "https://nouns.wtf",
  },
  {
    title: "sampleProposals",
    imgSrc: inspo2img,
    external: true,
    destination: "https://nouns.wtf/vote",
  },
  {
    title: "faq",
    external: false,
    imgSrc: inspo3img,
    destination: "/faq/",
  },
];

const ItemCard = (item: ItemData) => {
  const { t } = useTranslation();

  return (
    <BSCard className={classes.itemCard}>
      <BSCard.Img variant="top" src={item.imgSrc} />
      <BSCard.Body>
        <BSCard.Title>
          {t(item.title)}
          <span className={classes.arrow}>→</span>
        </BSCard.Title>
      </BSCard.Body>
    </BSCard>
  );
};

const InspirationCard = () => {
  const { t } = useTranslation();

  const itemCards = itemCardData.map((item) => (
    <Col xl={4} key={item.title}>
      {item.external ? (
        <a href={item.destination} target="_blank" rel="noreferrer">
          {ItemCard(item)}
        </a>
      ) : (
        <Link to={item.destination}> {ItemCard(item)}</Link>
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
          <h2>{t("needInspiration")}</h2>
          <p>{t("learnMoreBelow")}</p>
        </Col>
        {itemCards}
      </Row>
    </Card>
  );
};

export default InspirationCard;
