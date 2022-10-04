import React from 'react';
import classes from './HouseSkeletonCards.module.css';
import ContentLoader from 'react-content-loader';

const HouseSkeletonCards: React.FC<{
  numberOfCards: number;
}> = props => {
  const { numberOfCards } = props;

  return (
    <div className={classes.skeletonGrid}>
      {[...Array(numberOfCards)].map(i => (
        <div className={classes.loadingSvg} key={i}>
          <ContentLoader
            height={230}
            speed={1}
            viewBox="0 0 400 230"
            backgroundColor={'#ededed'}
            foregroundColor={'#f2f2f2'}
            preserveAspectRatio="none"
          >
            {/* title */}
            <rect x="15" y="5" rx="3" ry="3" width="130" height="25"></rect>

            {/* status pill */}
            <rect x="313" y="5" rx="10" ry="50" width="74" height="25"></rect>

            {/* text line 1 */}
            <rect x="15" y="60" rx="3" ry="3" width="90" height="10" />
            <rect x="115" y="60" rx="3" ry="3" width="60" height="10" />
            <rect x="185" y="60" rx="3" ry="3" width="200" height="10" />

            {/* text line 2 */}
            <rect x="15" y="100" rx="3" ry="3" width="130" height="10" />
            <rect x="160" y="100" rx="3" ry="3" width="120" height="10" />
            <rect x="290" y="100" rx="3" ry="3" width="95" height="10" />

            {/* text line 3 */}
            <rect x="15" y="140" rx="3" ry="3" width="130" height="10" />
            <rect x="160" y="140" rx="3" ry="3" width="225" height="10" />

            {/* footer titles */}
            <rect x="15" y="180" rx="3" ry="3" width="50" height="15" />
            <rect x="150" y="180" rx="3" ry="3" width="50" height="15" />
            <rect x="285" y="180" rx="3" ry="3" width="50" height="15" />

            {/* footer info */}
            <rect x="15" y="202" rx="3" ry="3" width="100" height="25" />
            <rect x="150" y="202" rx="3" ry="3" width="100" height="25" />
            <rect x="285" y="202" rx="3" ry="3" width="100" height="25" />
          </ContentLoader>
        </div>
      ))}
    </div>
  );
};

export default HouseSkeletonCards;
