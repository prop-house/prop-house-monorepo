import { Dispatch, SetStateAction } from 'react';
import Button, { ButtonColor } from '../Button';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import ManagerInstruction from '../ManagerInstruction';
import classes from './ManagerSecondaryCard.module.css';

const ManagerSecondaryCard: React.FC<{
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
}> = props => {
  const { activeStep, setActiveStep } = props;

  const instructions = [
    {
      title: 'Create a House',
      instruction:
        'Define the parameters for your your contract. These includes title, image, description and the voting strategies.',
      button: (
        <Button
          disabled={activeStep !== 1}
          text="Deploy contract"
          bgColor={ButtonColor.Pink}
          onClick={() => {
            setActiveStep(activeStep + 1);
          }}
        />
      ),
      optional: false,
    },
    {
      title: 'Deposit funds',
      instruction:
        'Approve and deposit the funds used to reward Round winners. Rewards can come in the form of ETH, ERC20s, ERC721s, or ERC1155s.',
      button: (
        <Button
          disabled={activeStep !== 2}
          text="Set up round"
          bgColor={ButtonColor.Pink}
          onClick={() => {
            setActiveStep(activeStep + 1);
          }}
        />
      ),
      optional: true,
    },
    {
      title: 'Initiate a round',
      instruction:
        'Define the name, description, awards types and other parameters to kick off your first Round.',
      button: (
        <Button
          disabled={activeStep !== 3}
          text="Reset to step 1"
          bgColor={ButtonColor.Pink}
          onClick={() => {
            setActiveStep(1);
          }}
        />
      ),
      optional: true,
    },
  ];

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.secondaryCard}
      >
        <p className={classes.title}>Create your House</p>

        <hr className={classes.divider} />
        {instructions.map((i, idx) => (
          <>
            <ManagerInstruction
              activeStep={activeStep}
              number={idx + 1}
              title={i.title}
              instruction={i.instruction}
              button={i.button}
              optional={i.optional}
            />

            {idx !== instructions.length - 1 && <hr className={classes.divider} />}
          </>
        ))}
      </Card>
    </>
  );
};

export default ManagerSecondaryCard;
