import classes from './RoundAwardsDisplay.module.css';
import { Round } from '@prophouse/sdk-react';
import useFullRoundAwards, { FullRoundAward } from '../../hooks/useFullRoundAwards';
import { HiTrophy } from 'react-icons/hi2';
import { trophyColors } from '../../utils/trophyColors';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import clsx from 'clsx';
import { isMobile } from 'web3modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';

const RoundAwardsDisplay: React.FC<{ round: Round }> = props => {
  const { round } = props;
  const [loadingFullAwards, fullAwards] = useFullRoundAwards(round.config.awards);
  const [awardsIndex, setAwardsIndex] = useState(0);
  const isInitialPage = awardsIndex === 0;
  const isLastPage = awardsIndex === Math.floor(round.config.awards.length / 6);

  const awardDisplay = (award: FullRoundAward, place: number) => {
    return (
      <div className={clsx(classes.awardDisplay)}>
        <span className={classes.placeIndicator}>
          {place < 4 ? (
            <HiTrophy
              size={14}
              color={trophyColors(place === 0 ? 'first' : place === 1 ? 'second' : 'third')}
            />
          ) : (
            <>{place}</>
          )}
        </span>
        <img src={award.tokenImg} alt="token logo" />
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
  };

  return loadingFullAwards ? (
    <LoadingIndicator />
  ) : (
    <div className={clsx(classes.awardsAndNavigationContainer, isMobile() && classes.breakOut)}>
      {isMobile() ? (
        <Swiper
          slidesPerView={4}
          spaceBetween={12}
          className={classes.swiper}
          slidesOffsetBefore={12}
          slidesOffsetAfter={12}
        >
          {fullAwards &&
            fullAwards.map((award, i) => (
              <SwiperSlide key={i} className={classes.swiperSlide}>
                {awardDisplay(award, i)}
              </SwiperSlide>
            ))}
        </Swiper>
      ) : (
        <>
          <div className={classes.awardDisplayContainer}>
            {fullAwards &&
              fullAwards
                .slice(awardsIndex * 6, (awardsIndex + 1) * 6)
                .map((award, i) => awardDisplay(award, awardsIndex * 6 + i + 1))}
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
        </>
      )}
    </div>
  );
};
export default RoundAwardsDisplay;
