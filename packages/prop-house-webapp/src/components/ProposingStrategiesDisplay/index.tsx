import classes from './ProposingStrategiesDisplay.module.css';
import { ProposingStrategy, GovPowerStrategyType } from '@prophouse/sdk-react';
import trimEthAddress from '../../utils/trimEthAddress';
import { useState } from 'react';
import Modal from '../Modal';
import { BsPersonFill } from 'react-icons/bs';
import buildEtherscanPath from '../HouseManager/utils/buildEtherscanPath';

const ProposingStrategiesDisplay: React.FC<{
  proposingStrategies: ProposingStrategy[];
  propThreshold: number;
}> = props => {
  const { proposingStrategies, propThreshold } = props;
  console.log('proposing strats: ', proposingStrategies);

  const [showModal, setShowModal] = useState(false);

  const oneStrat = proposingStrategies.length === 1;
  const oneStratAndAllowListHasOneMember =
    oneStrat &&
    proposingStrategies[0].strategyType === GovPowerStrategyType.ALLOWLIST &&
    proposingStrategies[0].members.length === 1;

  const formattedContent = (content: JSX.Element) => (
    <div className={classes.singleStratDisplayContainer}>
      <div className={classes.icon}>
        <BsPersonFill color="" />
      </div>
      <p className={classes.content}>{content}</p>
    </div>
  );

  const singleStratCopy = (strat: ProposingStrategy, memberIndex?: number) => {
    let copy = <>allowlist detected, todo: resolve when implemented</>;
    const stratType = strat.strategyType;

    if (stratType === GovPowerStrategyType.ALLOWLIST && memberIndex)
      copy = (
        <>
          <a href={buildEtherscanPath(strat.members[memberIndex].address)} target="_blank">
            {trimEthAddress(strat.members[memberIndex].address)}
          </a>{' '}
          can propose.
        </>
      );

    if (stratType === GovPowerStrategyType.BALANCE_OF)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token can propose. {propThreshold > 1 && `${propThreshold} tokens required`}
        </>
      );

    if (stratType === GovPowerStrategyType.ERC1155_BALANCE_OF)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token with id {strat.tokenId} can propose. {propThreshold} tokens required.;
        </>
      );

    // todo: remove vanilla check for prod as it won't make it there
    if (stratType === GovPowerStrategyType.VANILLA) copy = <>vanilla strat.</>;
    if (stratType === GovPowerStrategyType.UNKNOWN) copy = <>Error reading proposing strategy</>;

    return formattedContent(copy);
  };

  const multiStratContent = (strats: ProposingStrategy[]) => {
    console.log(strats);
    return (
      <div className={classes.modalBody}>
        {strats.map(strat => {
          if (strat.strategyType === GovPowerStrategyType.ALLOWLIST) {
            strat.members.map((_, index) => {
              return <p>{singleStratCopy(strat, index)}</p>;
            });
          }
          return <p>{singleStratCopy(strat)}</p>;
        })}
      </div>
    );
  };

  return showModal ? (
    <Modal
      title="Proposing eligibility"
      subtitle="Below is the criteria required to propose"
      body={multiStratContent(proposingStrategies)}
      setShowModal={setShowModal}
    />
  ) : proposingStrategies.length === 0 ? (
    formattedContent(<>All accounts are welcome to propose.</>)
  ) : oneStratAndAllowListHasOneMember || oneStrat ? (
    singleStratCopy(proposingStrategies[0])
  ) : (
    <a onClick={() => setShowModal(true)}>
      {formattedContent(
        <>
          Owners of multiple tokens can propose. <a>See who can propose ↗</a>
        </>,
      )}
    </a>
  );
};

export default ProposingStrategiesDisplay;
