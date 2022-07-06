import React from "react";
import Button, { ButtonColor } from "../Button";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import classes from "./CTA.module.css";

const CTA: React.FC<{
  title: string;
  content: React.ReactNode;
  btnTitle: string;
  btnAction: () => void;
}> = (props) => {
  const { title, content, btnTitle, btnAction } = props;
  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={classes.containerCard}
    >
      <div className={classes.content}>
        <h1 style={{ fontSize: "1.5rem" }}>{title}</h1>
        <p style={{ marginBottom: "0" }}>{content}</p>
      </div>
      <div className={classes.btnContainer}>
        <Button
          text={btnTitle}
          bgColor={ButtonColor.Green}
          onClick={btnAction}
        />
      </div>
    </Card>
  );
};

export default CTA;
