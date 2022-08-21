import classes from "./FullAuction.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import Button, { ButtonColor } from "../Button";
import { useTranslation } from "react-i18next";

export const emptyCard = (copy: string) => (
  <Card
    bgColor={CardBgColor.LightPurple}
    borderRadius={CardBorderRadius.twenty}
    classNames={classes.noPropCard}
  >
    <>{copy}</>
  </Card>
);
export const AuctionNotStartedContent = () => {
  const { t } = useTranslation();
  return emptyCard(t('proposalsHere'));
};
export const AuctionEmptyContent = () => {
  const { t } = useTranslation();

  return emptyCard(t('submittedProps'));
};

// alert to get nouners to connect when auctions in voting stage
export const DisconnectedCopy = (onClick: () => void, houseName: string) => {
  const { t } = useTranslation();

  return (
    <div className={classes.alertWrapper}>
      <div style={{ margin: '0rem 1rem 0rem 0rem' }}>
        <h4
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            margin: '0rem 0rem 0.25rem 0rem',
          }}
        >
          {t('votingOpen')}
        </h4>

        <p>{`${t('votingPeriod1')} ${houseName} ${t('votingPeriod2')}`}</p>
      </div>
      <Button text={t('connect')} bgColor={ButtonColor.Pink} onClick={onClick} />
    </div>
  );
};

// alert verifying that connected wallet is a eligible to vote
export const ConnectedCopy = () => {
  const { t } = useTranslation();

  return <div className={classes.connectedCopy}>{t("connectedCopy")}</div>;
};
