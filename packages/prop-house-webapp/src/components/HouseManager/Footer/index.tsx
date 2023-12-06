import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { NewRound, setNextStep, setPrevStep } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { HouseInfo, HouseType, RoundInfo, RoundType } from '@prophouse/sdk-react';
import { usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import CreateRoundModal from '../CreateRoundModal';
import { useWaitForTransaction } from 'wagmi';
import { isRoundFullyFunded } from '../../../utils/isRoundFullyFunded';
import { parseEther } from 'viem';
import { getRoundAddressWithContractTx } from '../../../utils/getRoundAddressWithContractTx';

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
  const [newRoundAddress, setNewRoundAddress] = useState<string | undefined>();
  const [refetchCount, setRefetchCount] = useState(0);
  const [fetchNewRound, setFetchNewRound] = useState(false);
  const [newRoundAvail, setNewRoundAvail] = useState(false);

  // Wagmi hook that will wait for a transaction to be mined and
  // `waitForTransaction` is the tx state (loading/success/error)
  const waitForTransaction = useWaitForTransaction({ hash: transactionHash as `0x${string}` });

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];

    if (!isDisabled) dispatch(setNextStep());
  };

  const handlePrev = () => dispatch(setPrevStep());

  useEffect(() => {
    if (!fetchNewRound || !newRoundAddress) return;

    if (refetchCount > 4 && !newRoundAvail) waitForTransaction.isError = true;

    const interval = setInterval(() => {
      setRefetchCount(prevCount => prevCount + 1);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNewRound, newRoundAddress, newRoundAvail, refetchCount, waitForTransaction]);

  useEffect(() => {
    if (!fetchNewRound || !newRoundAddress) return;
    const fetchNewRoundIsAvail = async () => {
      try {
        const newRoundIsAvail = await propHouse.query.getRoundWithHouseInfo(newRoundAddress);
        if (newRoundIsAvail) setNewRoundAvail(true);
      } catch (e) {
        console.log('round not found: ', e);
      }
    };

    if (refetchCount < 5) {
      fetchNewRoundIsAvail();
    }
  }, [refetchCount, newRoundAddress, fetchNewRound, propHouse.query]);

  const handleCreateRound = async (round: NewRound) => {
    setShowCreateRoundModal(true);

    const houseInfo: HouseInfo<HouseType> = {
      houseType: HouseType.COMMUNITY,
      config: { contractURI: round.house.contractURI },
    };

    const metaTxArgs = {
      relayer: '0x2eb240175557a2e795abd424Eb481d282317b102',
      deposit: parseEther('0.01').toString(), // funds proposing & voting for round
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
        // metaTx: { ...metaTxArgs },
      },
    };

    if (round.house.existingHouse) {
      // If the house already exists, use the `createRoundOnExistingHouse` function
      try {
        const res = await propHouse.createRoundOnExistingHouse(round.house.address, roundInfo);
        setTransactionHash(res.hash);
        setNewRoundAddress(await getRoundAddressWithContractTx(res));
        setFetchNewRound(true);

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
          roundAddress={newRoundAddress && newRoundAvail ? newRoundAddress : undefined}
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
