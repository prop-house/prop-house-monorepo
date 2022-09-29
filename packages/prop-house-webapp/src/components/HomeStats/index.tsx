import classes from './HomeStats.module.css';
import CountUp from 'react-countup';
import { StatsProps } from '../pages/Home';

interface HomeStatsProps {
  stats: StatsProps;
}

const HomeStats = ({ stats }: HomeStatsProps) => {
  return (
    <div className={classes.statsContainer}>
      <div className={classes.stat}>
        <CountUp start={0} end={stats.accEthFunded}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>ETH funded</p>
      </div>

      <div className={classes.stat}>
        <CountUp start={0} end={stats.accRounds}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>Funding Rounds</p>
      </div>

      <div className={classes.stat}>
        <CountUp start={0} end={stats.accProps}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>Submitted props</p>
      </div>
    </div>
  );
};

export default HomeStats;
