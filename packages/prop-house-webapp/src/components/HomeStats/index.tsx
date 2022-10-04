import classes from './HomeStats.module.css';
import CountUp from 'react-countup';
import { StatsProps } from '../pages/Home';
import { useState } from 'react';
import TruncateThousands from '../TruncateThousands';

interface HomeStatsProps {
  stats: StatsProps;
}

const HomeStats = ({ stats }: HomeStatsProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onEnd = () => {
    setLoading(true);
  };

  return (
    <div className={classes.statsContainer}>
      {!loading ? (
        <>
          <div className={classes.stat}>
            <CountUp start={0} end={stats.accEthFunded} suffix="+" delay={0} onEnd={onEnd}>
              {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
            </CountUp>
            <p className={classes.subtitle}>ETH funded</p>
          </div>
          <div className={classes.stat}>
            <CountUp start={0} end={stats.accRounds} suffix="+" delay={0} onEnd={onEnd}>
              {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
            </CountUp>
            <p className={classes.subtitle}>Funding Rounds</p>
          </div>
          <div className={classes.stat}>
            <CountUp start={0} end={stats.accProps} suffix="+" delay={0} onEnd={onEnd}>
              {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
            </CountUp>
            <p className={classes.subtitle}>Submitted props</p>
          </div>
        </>
      ) : (
        <>
          <div className={classes.stat}>
            <span className={classes.amount}>
              <TruncateThousands amount={stats.accEthFunded} />+
            </span>
            <p className={classes.subtitle}>ETH funded</p>
          </div>

          <div className={classes.stat}>
            <span className={classes.amount}>
              <TruncateThousands amount={stats.accRounds} />+
            </span>
            <p className={classes.subtitle}>Funding Rounds</p>
          </div>

          <div className={classes.stat}>
            <span className={classes.amount}>
              <TruncateThousands amount={stats.accProps} />+
            </span>
            <p className={classes.subtitle}>Submitted props</p>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeStats;
