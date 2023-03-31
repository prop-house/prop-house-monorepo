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

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const stepDisabledArray = useAppSelector(state => state.round.stepDisabledArray);
  const round = useAppSelector(state => state.round.round);

  const dispatch = useDispatch();

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];
    if (!isDisabled) {
      dispatch(setNextStep());
    }
  };

  const handlePrev = () => dispatch(setPrevStep());

  const propHouse = usePropHouse();

  const handleCreateRound = async (round: NewRound) => {
    const contractURIObject = {
      name: round.house.title,
      description: round.house.description,
      image: round.house.image,
      external_link: `https://prop.house/${round.house.address}`,
      seller_fee_basis_points: 0,
      fee_recipient: '0x0000000000000000000000000000000000000000',
    };

    const houseInfo: HouseInfo<HouseType> = {
      houseType: HouseType.COMMUNITY,
      config: {
        contractURI: JSON.stringify(contractURIObject),
      },
    };

    const awards: Asset[] = round.awards.map(award => {
      switch (award.type) {
        case AssetType.ETH:
          return {
            assetType: AssetType.ETH,
            amount: ethers.utils.parseEther(award.amount.toString()),
          };
        case AssetType.ERC20:
          return {
            assetType: AssetType.ERC20,
            address: award.address,
            amount: BigNumber.from(award.amount),
          };
        case AssetType.ERC721:
          return {
            assetType: AssetType.ERC721,
            address: award.address,
            tokenId: BigNumber.from(award.tokenId || 0),
          };
        case AssetType.ERC1155:
          return {
            assetType: AssetType.ERC1155,
            address: award.address,
            tokenId: BigNumber.from(award.tokenId || 0),
            amount: BigNumber.from(award.amount),
          };
        default:
          throw new Error('Invalid award type');
      }
    });

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
      const response = await propHouse.createRoundOnExistingHouse(round.house.address, roundInfo);
      console.log('res', response);
      return response;
    } else {
      const response = await propHouse.createRoundOnNewHouse(houseInfo, roundInfo);
      console.log('res', response);
      return response;
    }
  };

  return (
    <>
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
