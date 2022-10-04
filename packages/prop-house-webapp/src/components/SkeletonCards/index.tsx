import React from 'react';
import classes from './SkeletonCards.module.css';
import ContentLoader from 'react-content-loader';
import clsx from 'clsx';

const SkeletonCards: React.FC<{
  numberOfCards: number;
  column?: boolean;
}> = props => {
  const { numberOfCards, column } = props;

  return (
    <div className={clsx(classes.skeletonGrid, column && classes.column)}>
      {[...Array(numberOfCards)].map(i => (
        <div className={classes.loadingSvg} key={i}>
          <ContentLoader
            height={225}
            speed={1}
            backgroundColor={'#ededed'}
            foregroundColor={'#f2f2f2'}
            preserveAspectRatio="none"
          >
            <rect x="0" y="0" rx="24" ry="24" height="100%" width="100%" />
          </ContentLoader>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCards;
