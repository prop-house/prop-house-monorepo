import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { NewRound, setNextStep, setPrevStep } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { Asset, AssetType, HouseInfo, HouseType, RoundInfo, RoundType } from '@prophouse/sdk-react';
import { usePropHouse } from '@prophouse/sdk-react';
import { BigNumber, ethers } from 'ethers';
import { Award } from '../AssetSelector';
import { useState } from 'react';
import CreateRoundModal from '../CreateRoundModal';
import { useWaitForTransaction } from 'wagmi';

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const stepDisabledArray = useAppSelector(state => state.round.stepDisabledArray);
  const round = useAppSelector(state => state.round.round);

  const dispatch = useDispatch();
  const propHouse = usePropHouse();

  const [createRoundModal, setShowCreateRoundModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const waitForTransaction = useWaitForTransaction({
    hash: transactionHash as `0x${string}`,
    onSettled: (data, error) => {
      if (error) {
        console.log('Tx error', error);

        // Handle error case, e.g. show a notification
      } else {
        console.log('Tx success', data);
        // Handle success case, e.g. navigate to a different page
      }
    },
  });

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];
    if (!isDisabled) {
      dispatch(setNextStep());
    }
  };

  const handlePrev = () => dispatch(setPrevStep());

  const handleCreateRound = async (round: NewRound) => {
    setShowCreateRoundModal(true);

    const houseInfo: HouseInfo<HouseType> = {
      houseType: HouseType.COMMUNITY,
      config: { contractURI: round.house.contractURI },
    };

    // Takes our Award type and converts it to an Asset type
    const createAward = (award: Award) => {
      switch (award.type) {
        case AssetType.ETH:
          return {
            assetType: AssetType.ETH,
            amount: ethers.utils.parseEther(award.amount.toString()),
          } as Asset;
        case AssetType.ERC20:
          return {
            assetType: AssetType.ERC20,
            address: award.address,
            // ERC20 token amounts are represented in base units (the smallest sub-division of the token),
            // and need to be parsed using the token decimals to be handled correctly
            amount: ethers.utils.parseUnits(award.amount.toString(), award.decimals).toString(),
          } as Asset;
        case AssetType.ERC721:
          return {
            assetType: AssetType.ERC721,
            address: award.address,
            tokenId: BigNumber.from(award.tokenId || 0),
          } as Asset;
        case AssetType.ERC1155:
          return {
            assetType: AssetType.ERC1155,
            address: award.address,
            tokenId: BigNumber.from(award.tokenId || 0),
            amount: BigNumber.from(award.amount),
          } as Asset;
        default:
          throw new Error('Invalid award type');
      }
    };

    let awards: Asset[] = [];

    // Split Awards: each winner gets the same award
    if (round.splitAwards) {
      awards = Array.from({ length: round.numWinners }, () => round.awards)
        .flat()
        .map(createAward);
    } else {
      // Individual Awards: map each award to an Asset
      // the number of winners is equal to the number of awards
      awards = round.awards.map(createAward);
    }

    const roundInfo: RoundInfo<RoundType> = {
      roundType: RoundType.TIMED_FUNDING,
      title: round.title,
      description: round.description,
      config: {
        awards,
        strategies: round.strategies,
        proposalPeriodStartUnixTimestamp: round.proposalPeriodStartUnixTimestamp,
        proposalPeriodDurationSecs: round.proposalPeriodDurationSecs,
        votePeriodDurationSecs: round.votePeriodDurationSecs,
        winnerCount: round.numWinners,
      },
    };

    if (round.house.existingHouse) {
      try {
        const response = await propHouse.createRoundOnExistingHouse(round.house.address, roundInfo);

        return response;
      } catch (e) {
        console.log('error', e);
      }
    } else {
      if (round.house.contractURI !== '') {
        try {
          const response = await propHouse.createRoundOnNewHouse(houseInfo, roundInfo);
          setTransactionHash(response.hash);
          return response;
        } catch (e) {
          console.log('error', e);
          // Handle error case, e.g. show a notification
        }
      }
    }
  };

  return (
    <>
      {createRoundModal && (
        <CreateRoundModal
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
            text="Create"
            disabled={stepDisabledArray[5]}
            bgColor={ButtonColor.Pink}
            onClick={() => handleCreateRound(round)}
          />
        )}
      </div>
    </>
  );
};

export default Footer;
