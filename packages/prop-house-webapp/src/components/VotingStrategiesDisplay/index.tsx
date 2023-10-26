import classes from '../ProposingStrategiesDisplay/ProposingStrategiesDisplay.module.css';
import { ProposingStrategy, GovPowerStrategyType, VotingStrategy } from '@prophouse/sdk-react';
import trimEthAddress from '../../utils/trimEthAddress';
import { useState } from 'react';
import Modal from '../Modal';
import buildEtherscanPath from '../HouseManager/utils/buildEtherscanPath';
import { MdHowToVote } from 'react-icons/md';

const VotingStrategiesDisplay: React.FC<{
  votingStrategies: VotingStrategy[];
}> = props => {
  const { votingStrategies } = props;

  const [showModal, setShowModal] = useState(false);

  const oneStrat = votingStrategies.length === 1;
  const oneStratAndAllowListHasOneMember =
    oneStrat &&
    votingStrategies[0].strategyType === GovPowerStrategyType.ALLOWLIST &&
    votingStrategies[0].members.length === 1;

  const formattedContent = (content: JSX.Element) => (
    <div className={classes.singleStratDisplayContainer}>
      <div className={classes.icon}>
        <MdHowToVote />
      </div>
      <p>{content}</p>
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
          can vote with {strat.members[memberIndex].govPower} votes.
        </>
      );

    if (stratType === GovPowerStrategyType.BALANCE_OF)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank" rel="noreferrer">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token can vote. {strat.multiplier ? strat.multiplier : 1} vote per token.
        </>
      );

    if (stratType === GovPowerStrategyType.BALANCE_OF_ERC1155)
      copy = (
        <>
          Owners of the{' '}
          <a href={buildEtherscanPath(strat.tokenAddress)} target="_blank" rel="noreferrer">
            {trimEthAddress(strat.tokenAddress)}
          </a>{' '}
          token with id {strat.tokenId} can vote. {strat.multiplier ? strat.multiplier : 1} vote per
          token.;
        </>
      );

    if (stratType === GovPowerStrategyType.UNKNOWN) copy = <>Error reading voting strategy</>;

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
      title="Voting eligibility"
      subtitle="Below is the criteria required to vote"
      body={multiStratContent(votingStrategies)}
      setShowModal={setShowModal}
    />
  ) : oneStratAndAllowListHasOneMember || oneStrat ? (
    singleStratCopy(votingStrategies[0])
  ) : (
    <div onClick={() => setShowModal(true)}>
      {formattedContent(
        <>
          Owners of multiple tokens can vote. <span>See who can vote ↗</span>
        </>,
      )}
    </div>
  );
};

export default VotingStrategiesDisplay;
