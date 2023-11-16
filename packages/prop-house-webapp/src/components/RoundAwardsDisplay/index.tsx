import classes from './RoundAwardsDisplay.module.css';
import { AssetType, Round } from '@prophouse/sdk-react';
import { HiTrophy } from 'react-icons/hi2';
import { trophyColors } from '../../utils/trophyColors';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { useState } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import clsx from 'clsx';
import { isMobile } from 'web3modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import useAssetsWithMetadata, { AssetWithMetadata } from '../../hooks/useAssetsWithMetadata';

const RoundAwardsDisplay: React.FC<{ round: Round }> = props => {
  const { round } = props;
  const [loadingAssetsWithMetadata, assetsWithMetadata] = useAssetsWithMetadata(
    round.config.awards,
  );
  const [awardsIndex, setAwardsIndex] = useState(0);
  const isInitialPage = awardsIndex === 0;
  const isLastPage = awardsIndex === Math.floor(round.config.awards.length / 6);

  const awardDisplay = (award: AssetWithMetadata, place: number) => {
    return (
      <div className={clsx(classes.awardDisplay)}>
        <span className={classes.placeIndicator}>
          {place < 4 ? (
            <HiTrophy
              size={14}
              color={trophyColors(place === 1 ? 'first' : place === 2 ? 'second' : 'third')}
            />
          ) : (
            <>{place}</>
          )}
        </span>
        <img src={award.tokenImg} alt="token logo" />
        <div className={classes.amountAndSymbolLabel}>
          {award.assetType === AssetType.ERC721 ? (
            <>
              {award.symbol} {award.tokenId}
            </>
          ) : award.assetType === AssetType.ERC1155 ? (
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

  return loadingAssetsWithMetadata ? (
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
          {assetsWithMetadata &&
            assetsWithMetadata.map((asset, i) => (
              <SwiperSlide key={i} className={classes.swiperSlide}>
                {awardDisplay(asset, i + 1)}
              </SwiperSlide>
            ))}
        </Swiper>
      ) : (
        <>
          <div className={classes.awardDisplayContainer}>
            {assetsWithMetadata &&
              assetsWithMetadata
                .slice(awardsIndex * 6, (awardsIndex + 1) * 6)
                .map((asset, i) => awardDisplay(asset, awardsIndex * 6 + i + 1))}
          </div>
          {assetsWithMetadata && assetsWithMetadata.length > 6 && (
            <div className={classes.navContainer}>
              <button
                className={classes.awardsNavControl}
                onClick={() => setAwardsIndex(prev => prev - 1)}
                disabled={isInitialPage}
              >
                <FaArrowUp size={10} />
              </button>
              <button
                className={classes.awardsNavControl}
                onClick={() => setAwardsIndex(prev => prev + 1)}
                disabled={isLastPage}
              >
                <FaArrowDown size={10} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default RoundAwardsDisplay;
