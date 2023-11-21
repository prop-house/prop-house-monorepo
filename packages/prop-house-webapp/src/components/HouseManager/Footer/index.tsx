import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { NewRound, setNextStep, setPrevStep } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { HouseInfo, HouseType, RoundInfo, RoundType } from '@prophouse/sdk-react';
import { usePropHouse } from '@prophouse/sdk-react';
import { useState } from 'react';
import CreateRoundModal from '../CreateRoundModal';
import { useWaitForTransaction } from 'wagmi';
import { isRoundFullyFunded } from '../../../utils/isRoundFullyFunded';

/**
 * @overview
 * Handles step progression, which buttons to show, and the new round creation logic
 *
 * @function handleCreateRound - calls the specific create round function based on config
 *
 * @components
 * @name CreateRoundModal - modal that shows the tx state
 */

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const stepDisabledArray = useAppSelector(state => state.round.stepDisabledArray);
  const round = useAppSelector(state => state.round.round);

  const dispatch = useDispatch();
  const propHouse = usePropHouse();

  const [createRoundModal, setShowCreateRoundModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Wagmi hook that will wait for a transaction to be mined and
  // `waitForTransaction` is the tx state (loading/success/error)
  const waitForTransaction = useWaitForTransaction({ hash: transactionHash as `0x${string}` });

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];

    if (!isDisabled) dispatch(setNextStep());
  };

  const handlePrev = () => dispatch(setPrevStep());

  const handleCreateRound = async (round: NewRound) => {
    setShowCreateRoundModal(true);

    const houseInfo: HouseInfo<HouseType> = {
      houseType: HouseType.COMMUNITY,
      config: { contractURI: round.house.contractURI },
    };

    const roundInfo: RoundInfo<RoundType> = {
      roundType: round.roundType,
      title: round.title,
      description: round.description,
      config: {
        awards: round.awards,
        votingStrategies: round.voters,
        proposalPeriodStartUnixTimestamp: round.proposalPeriodStartUnixTimestamp,
        proposalPeriodDurationSecs: round.proposalPeriodDurationSecs,
        votePeriodDurationSecs: round.votePeriodDurationSecs,
        winnerCount: round.numWinners,
      },
    };

    // If depositing funds is not enabled, use the original "non-funding" functions
    if (round.house.existingHouse) {
      // If the house already exists, use the `createRoundOnExistingHouse` function
      try {
        const res = await propHouse.createRoundOnExistingHouse(round.house.address, roundInfo);
        setTransactionHash(res.hash);
        return res;
      } catch (e) {
        console.log('error', e);
      }
    } else if (round.house.contractURI !== '') {
      // If the house doesn't exist yet, use the `createRoundOnNewHouse` function
      try {
        const res = await propHouse.createRoundOnNewHouse(houseInfo, roundInfo);
        setTransactionHash(res.hash);
        return res;
      } catch (e) {
        console.log('error', e);
      }
    }
  };

  const isAnyTokenAllocated = round.funding.tokens.some(token => token.allocated > 0);

  return (
    <>
      {createRoundModal && (
        <CreateRoundModal
          roundName={round.title}
          houseName={round.house.title}
          status={{
            isLoading: waitForTransaction.isLoading,
            isSuccess: waitForTransaction.isSuccess,
            isError: waitForTransaction.isError,
            error: waitForTransaction.error,
          }}
          setShowCreateRoundModal={setShowCreateRoundModal}
        />
      )}

      <Divider />

      <div className={clsx(classes.footer, activeStep < 3 && classes.justifyEnd)}>
        {activeStep > 2 && <Button text="Back" bgColor={ButtonColor.Black} onClick={handlePrev} />}

        {activeStep < 6 && (
          <Button
            text="Next"
            disabled={stepDisabledArray[activeStep - 1]}
            bgColor={ButtonColor.Pink}
            onClick={handleNext}
          />
        )}

        {activeStep === 6 && (
          <Button
            text={
              waitForTransaction.isLoading
                ? 'Pending'
                : waitForTransaction.isSuccess
                ? 'Success'
                : `Create ${
                    // If the user has opted to deposit funds
                    round.funding.depositingFunds
                      ? // there is at least one token with a non-zero allocation
                        isAnyTokenAllocated
                        ? // if round is fully funded
                          isRoundFullyFunded(round)
                          ? ' & fully fund round'
                          : ' & partially fund round'
                        : // If no token has a non-zero allocation
                          'round'
                      : // If the user has not opted to deposit funds
                        'round'
                  }`
            }
            disabled={stepDisabledArray[5]}
            bgColor={ButtonColor.Pink}
            onClick={() =>
              transactionHash ? setShowCreateRoundModal(true) : handleCreateRound(round)
            }
          />
        )}
      </div>
    </>
  );
};

export default Footer;
