import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import {
  initialRound,
  NewRound,
  setNextStep,
  setPrevStep,
  updateRound,
} from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';

// TODO: to be removed, just for testing
export const fullRound: NewRound = {
  title: 'Dummy Round',
  startTime: new Date('2023-03-07T09:00:00Z'),
  proposalEndTime: new Date('2023-03-14T09:00:00Z'),
  votingEndTime: new Date('2023-03-21T09:00:00Z'),
  numWinners: 3,
  currencyType: 'ETH',
  description: 'This is a dummy round for testing purposes.',
  votingContracts: [
    {
      id: '1',
      type: 'contract',
      addressValue: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      addressImage: 'https://storage.googleapis.com/opensea-static/tokens/USDC.png',
      addressName: 'USDC Coin',
      votesPerToken: 10,
      state: 'Success',
    },
    {
      id: '2',
      type: 'contract',
      addressValue: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
      addressImage:
        'https://i.seadn.io/gae/vfYB4RarIqixy2-wyfP4lIdK6fsOT8uNrmKxvYCJdjdRwAMj2ZjC2zTSxL-YKky0s-4Pb6eML7ze3Ouj54HrpUlfSWx52xF_ZK2TYw?w=500&auto=format',
      addressName: 'Nouns',
      votesPerToken: 5,
      state: 'Success',
    },
  ],
  votingUsers: [
    {
      id: '3',
      type: 'user',
      addressValue: '0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4',
      addressImage: '',
      addressName: '',
      votesPerToken: 1,
      state: 'Success',
    },
    {
      id: '4',
      type: 'user',
      addressValue: '0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00',
      addressImage: '',
      addressName: '',
      votesPerToken: 2,
      state: 'Success',
    },
  ],
  awards: [
    {
      id: '5',
      type: 'contract',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      image: 'https://storage.googleapis.com/opensea-static/tokens/USDC.png',
      name: 'USDC Coin',
      symbol: 'USDC',
      amount: 100,
      state: 'Success',
    },
  ],
};

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const round = useAppSelector(state => state.round.round);
  const stepDisabledArray = useAppSelector(state => state.round.stepDisabledArray);

  const dispatch = useDispatch();

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];
    if (!isDisabled) {
      dispatch(setNextStep());
    }
  };

  const handlePrev = () => dispatch(setPrevStep());

  return (
    <>
      <Divider />

      <div className={clsx(classes.footer, activeStep === 1 && classes.justifyEnd)}>
        {activeStep > 1 && <Button text="Back" bgColor={ButtonColor.Black} onClick={handlePrev} />}

        {/* // TODO: to be removed, just for testing */}
        {activeStep > 1 && (
          <div className={classes.btns}>
            <Button
              onClick={() => dispatch(updateRound({ ...initialRound }))}
              text="Clear"
              bgColor={ButtonColor.Red}
            />
            <Button
              onClick={() => dispatch(updateRound({ ...round, ...fullRound }))}
              text="Full"
              bgColor={ButtonColor.Purple}
            />
          </div>
        )}
        {/* // TODO: to be removed, just for testing */}
        {activeStep < 5 && (
          <Button
            text="Next"
            disabled={stepDisabledArray[activeStep - 1]}
            bgColor={ButtonColor.Pink}
            onClick={handleNext}
          />
        )}
        {activeStep === 5 && (
          <Button
            text="Create"
            disabled={stepDisabledArray[4]}
            bgColor={ButtonColor.Pink}
            onClick={() => {}}
          />
        )}
      </div>
    </>
  );
};

export default Footer;
