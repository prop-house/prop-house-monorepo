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
    let copy = <></>;
    const stratType = strat.strategyType;

    if (stratType === GovPowerStrategyType.ALLOWLIST && memberIndex !== undefined)
      copy = (
        <>
          <a
            href={buildEtherscanPath(strat.members[memberIndex].address)}
            target="_blank"
            rel="noreferrer"
          >
            {trimEthAddress(strat.members[memberIndex].address)}
          </a>{' '}
          can propose.
        </>
      );

    if (stratType === GovPowerStrategyType.BALANCE_OF)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank" rel="noreferrer">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token can propose. {propThreshold > 1 && `${propThreshold} tokens required`}
        </>
      );

    if (stratType === GovPowerStrategyType.BALANCE_OF_ERC1155)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank" rel="noreferrer">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token with id {strat.tokenId} can propose. {propThreshold} tokens required.;
        </>
      );

    if (stratType === GovPowerStrategyType.UNKNOWN) copy = <>Error reading proposing strategy</>;

    return formattedContent(copy);
  };

  const multiStratContent = (strats: ProposingStrategy[]) => {
    return (
      <div className={classes.modalBody}>
        {strats.map((strat, key) => {
          if (strat.strategyType === GovPowerStrategyType.ALLOWLIST)
            // iterate through ea member on the allowlist
            return strat.members.map((_, index) => (
              <div key={`${key}${index}`}>{singleStratCopy(strat, index)}</div>
            ));
          return <div key={key}>{singleStratCopy(strat)}</div>;
        })}
      </div>
    );
  };

  return showModal ? (
    <Modal
      modalProps={{
        title: 'Proposing eligibility',
        subtitle: 'Below is the criteria required to propose',
        body: multiStratContent(proposingStrategies),
        setShowModal: setShowModal,
      }}
    />
  ) : proposingStrategies.length === 0 ? (
    formattedContent(<>All accounts are welcome to propose.</>)
  ) : oneStratAndAllowListHasOneMember || oneStrat ? (
    singleStratCopy(proposingStrategies[0])
  ) : (
    <div onClick={() => setShowModal(true)}>
      {formattedContent(
        <>
          Owners of multiple tokens can propose. <span>See who can propose ↗</span>
        </>,
      )}
    </div>
  );
};

export default ProposingStrategiesDisplay;
