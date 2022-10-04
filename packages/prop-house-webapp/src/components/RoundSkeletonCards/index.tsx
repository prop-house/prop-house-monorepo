import React from 'react';
import classes from './RoundSkeletonCards.module.css';
import ContentLoader from 'react-content-loader';

const RoundSkeletonCards: React.FC<{
  numberOfCards: number;
}> = props => {
  const { numberOfCards } = props;

  return (
    <div className={classes.skeletonContainer}>
      <div className={classes.skeletonGrid}>
        {[...Array(numberOfCards)].map(i => (
          <div className={classes.loadingSvg} key={i}>
            <ContentLoader
              height={115}
              speed={1}
              viewBox="0 0 600 115"
              backgroundColor={'#ededed'}
              foregroundColor={'#f2f2f2'}
              preserveAspectRatio="none"
            >
              {/* title */}
              <rect x="15" y="5" rx="3" ry="3" width="55%" height="15"></rect>

              {/* text line 1 */}
              <rect x="15" y="40" rx="3" ry="3" width="120" height="10" />
              <rect x="150" y="40" rx="3" ry="3" width="140" height="10" />
              <rect x="305" y="40" rx="3" ry="3" width="280" height="10" />

              {/* text line 2 */}
              <rect x="15" y="60" rx="3" ry="3" width="190" height="10" />
              <rect x="220" y="60" rx="3" ry="3" width="160" height="10" />
              <rect x="395" y="60" rx="3" ry="3" width="175" height="10" />

              {/* footer */}
              <circle cx="28" cy="95" r="12" />
              <rect x="55" y="90" rx="3" ry="3" width="120" height="10" />
              <rect x="190" y="90" rx="3" ry="3" width="195" height="10" />
              <rect x="190" y="90" rx="3" ry="3" width="195" height="10" />
              <rect x="580" y="90" rx="3" ry="3" width="20" height="10" />
            </ContentLoader>
          </div>
        ))}
      </div>

      <div className={classes.skeletonInfoCardGrid}>
        <div className={classes.loadingSvg}>
          <ContentLoader
            height={200}
            speed={1}
            viewBox="0 0 400 200"
            backgroundColor={'#ededed'}
            foregroundColor={'#f2f2f2'}
            preserveAspectRatio="none"
          >
            {/* circle icon & title */}
            <circle cx="20" cy="20" r="20" />
            <rect x="48" y="2" rx="3" ry="3" width="175" height="15" />
            <rect x="48" y="25" rx="3" ry="3" width="112" height="10" />

            {/* subtitle */}
            <rect x="0" y="60" rx="3" ry="3" width="100" height="10" />

            {/* copy */}
            <rect x="0" y="80" rx="3" ry="3" width="250" height="6" />
            <rect x="0" y="96" rx="3" ry="3" width="250" height="6" />
            <rect x="0" y="110" rx="3" ry="3" width="118" height="6" />

            {/* button */}
            <rect x="0" y="175" rx="10" ry="10" width="255" height="20" />
          </ContentLoader>
        </div>
      </div>
    </div>
  );
};

export default RoundSkeletonCards;
