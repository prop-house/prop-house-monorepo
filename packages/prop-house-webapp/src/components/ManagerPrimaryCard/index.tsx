import Card, { CardBgColor, CardBorderRadius } from '../Card';
import ManagerAllowlistSection from '../ManagerAllowlistSection';
import ManagerDescriptionSection from '../ManagerDescriptionSection';
import ManagerNamingSection from '../ManagerNamingSection';
import ManagerStrategiesSection from '../ManagerStrategiesSection';
import classes from './ManagerPrimaryCard.module.css';

const ManagerPrimaryCard = () => {
  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.primaryCard}
      >
        <ManagerNamingSection />

        <hr className={classes.divider} />

        <ManagerDescriptionSection />

        <hr className={classes.divider} />

        <ManagerStrategiesSection />

        <hr className={classes.divider} />

        <ManagerAllowlistSection />
      </Card>
    </>
  );
};

export default ManagerPrimaryCard;
