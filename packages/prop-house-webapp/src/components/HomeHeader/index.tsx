import { Col, Row, Image } from "react-bootstrap";
import Button, { ButtonColor } from "../Button";
import classes from "./HomeHeader.module.css";
import { Link } from "react-router-dom";
import grempBulb from "../../assets/gremp-lightbulb.png";
import { useTranslation } from "react-i18next";

const HomeHeader = () => {
  const { t } = useTranslation();

  return (
    <Row className={classes.wrapper}>
      <Col lg={7} className={classes.leftCol}>
        <div className={classes.poweredByNouns}>
          {t("powered")}{" "}
          <a href="https://nouns.wtf" target="_blank" rel="noreferrer">
            {t("nounsdao")}
          </a>
        </div>

        <h1>{t("weekly")}</h1>

        <p>{t("bringToLife")}</p>
        <div className={classes.btnsContainer}>
          <Col xs={6} md="auto">
            <Link to="/learn">
              <Button text={t(`learnMore`)} bgColor={ButtonColor.Pink} />
            </Link>
          </Col>
          <Col xs={6} md="auto">
            <Link to={`/explore`}>
              <Button text={t(`viewHouses`)} bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </div>
      </Col>
      <Col lg={{ span: 4, offset: 1 }} className={classes.rightCol}>
        <Image src={grempBulb} fluid />
        <p>{t("artByGremplin")}</p>
      </Col>
    </Row>
  );
};

export default HomeHeader;
