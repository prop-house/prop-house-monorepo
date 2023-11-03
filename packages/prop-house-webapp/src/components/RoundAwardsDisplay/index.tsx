import classes from './RoundAwardsDisplay.module.css';
import { Round } from '@prophouse/sdk-react';
import useFullRoundAwards from '../../hooks/useFullRoundAwards';
import { HiTrophy } from 'react-icons/hi2';
import { trophyColors } from '../../utils/trophyColors';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import clsx from 'clsx';

const RoundAwardsDisplay: React.FC<{ round: Round }> = props => {
  const { round } = props;
  const [loadingFullAwards, fullAwards] = useFullRoundAwards(round.config.awards);
  const [awardsIndex, setAwardsIndex] = useState(0);
  const isInitialPage = awardsIndex === 0;
  const isLastPage = awardsIndex === Math.floor(round.config.awards.length / 6);

  return loadingFullAwards ? (
    <LoadingIndicator />
  ) : (
    <div className={classes.awardsAndNavigationContainer}>
      <div className={classes.awardDisplayContainer}>
        {fullAwards &&
          fullAwards.slice(awardsIndex * 6, (awardsIndex + 1) * 6).map((award, i) => {
            return (
              <div className={clsx(classes.awardDisplay)}>
                <span className={classes.placeIndicator}>
                  {i < 3 && isInitialPage ? (
                    <HiTrophy
                      size={14}
                      color={trophyColors(i === 0 ? 'first' : i === 1 ? 'second' : 'third')}
                    />
                  ) : (
                    <>{awardsIndex * 6 + i + 1}</>
                  )}
                </span>
                <img src={award.tokenImg} />
                <div className={classes.amountAndSymbolLabel}>
                  {award.asset.assetType === 'ERC721' ? (
                    <>
                      {award.symbol} {award.asset.identifier}
                    </>
                  ) : award.asset.assetType === 'ERC1155' ? (
                    <>
                      {award.parsedAmount} {award.symbol}
                    </>
                  ) : (
                    <>
                      {award.parsedAmount} {award.symbol}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {fullAwards && fullAwards.length > 6 && (
        <div className={classes.navContainer}>
          <button
            className={classes.awardsNavControl}
            onClick={() => setAwardsIndex(prev => prev - 1)}
            disabled={isInitialPage}
          >
            <FaArrowLeft size={10} />
          </button>
          <button
            className={classes.awardsNavControl}
            onClick={() => setAwardsIndex(prev => prev + 1)}
            disabled={isLastPage}
          >
            <FaArrowRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};
export default RoundAwardsDisplay;
