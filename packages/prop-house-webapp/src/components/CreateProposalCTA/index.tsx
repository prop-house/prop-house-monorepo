import classes from "./CreateProposalCTA.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import Button, { ButtonColor } from "../Button";
import { Form, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

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
