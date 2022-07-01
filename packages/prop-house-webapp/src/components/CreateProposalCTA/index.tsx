import classes from "./CreateProposalCTA.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import Button, { ButtonColor } from "../Button";
import { Form, Row, Col } from "react-bootstrap";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

const CreateProposalCTA = () => {
  const { t } = useTranslation();

  return (
    <Row className={classes.row}>
      <Col xl={12}>
        <Card
          bgColor={CardBgColor.DarkPurple}
          borderRadius={CardBorderRadius.twenty}
        >
          <div className={classes.wrapper}>
            <Form.Control
              size="lg"
              type="text"
              placeholder={t("describe")}
              className={classes.formInput}
            />
            <Button text={t("propose")} bgColor={ButtonColor.Pink} />
            <Button text={t("about")} bgColor={ButtonColor.White} />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateProposalCTA;
