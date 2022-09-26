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
        <CountUp start={0} end={stats.funded}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>ETH funded</p>
      </div>

      <div className={classes.stat}>
        <CountUp start={0} end={stats.votes}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>Total votes</p>
      </div>

      <div className={classes.stat}>
        <CountUp start={0} end={stats.props}>
          {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
        </CountUp>
        <p className={classes.subtitle}>Submitted props</p>
      </div>
    </div>
  );
};

export default HomeStats;
