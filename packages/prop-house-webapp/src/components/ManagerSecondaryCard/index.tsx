import Button, { ButtonColor } from '../Button';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import ManagerInstruction from '../ManagerInstruction';
import classes from './ManagerSecondaryCard.module.css';

const ManagerSecondaryCard = () => {
  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.secondaryCard}
      >
        <p className={classes.title}>Create your House</p>

        <hr className={classes.divider} />

        <ManagerInstruction
          number={1}
          title="Create a House"
          instruction="Define the parameters for your your contract. These includes title, image, description
            and the voting strategies."
          button={
            <Button
              text="Deploy contract"
              bgColor={ButtonColor.Pink}
              // onClick={() => {
              //   setShowErrorModal(false);
              // }}
            />
          }
        />

        <hr className={classes.divider} />

        <ManagerInstruction
          number={2}
          title="Deposit funds"
          instruction="Approve and deposit the funds used to reward Round winners. Rewards can come in the form of ETH, ERC20s, ERC721s, or ERC1155s."
          optional
        />

        <hr className={classes.divider} />

        <ManagerInstruction
          number={3}
          title="Initiate a round"
          instruction="Define the name, description, awards types and other parameters to kick off your first Round."
          optional
        />
      </Card>
    </>
  );
};

export default ManagerSecondaryCard;
