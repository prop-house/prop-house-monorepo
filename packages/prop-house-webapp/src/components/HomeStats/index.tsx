import classes from './HomeStats.module.css';
import CountUp from 'react-countup';
import { useState } from 'react';
import TruncateThousands from '../TruncateThousands';
import { useTranslation } from 'react-i18next';
import { GlobalStats } from '@prophouse/sdk-react';

interface HomeStatsProps {
  stats: GlobalStats;
}

const HomeStats = ({ stats }: HomeStatsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const onEnd = () => {
    setLoading(true);
  };

  const homeStats = [
    {
      amount: stats.roundCount,
      text: `${stats.roundCount === 1 ? t('fundingRoundCap') : t('fundingRoundsCap')}`,
    },
    {
      amount: stats.proposalCount,
      text: `${stats.proposalCount === 1 ? t('submittedProp') : t('submittedProps')}`,
    },
    {
      amount: stats.uniqueVoters,
      text: t('uniqueVoters'),
    },
  ];

  return (
    <div className={classes.statsContainer}>
      {homeStats.map(s => (
        <div className={classes.stat}>
          {!loading ? (
            <CountUp duration={1} start={0} end={s.amount} suffix="+" delay={0} onEnd={onEnd}>
              {({ countUpRef }) => <span ref={countUpRef} className={classes.amount} />}
            </CountUp>
          ) : (
            <span className={classes.amount}>
              <TruncateThousands amount={s.amount} />+
            </span>
          )}
          <p className={classes.subtitle}>{s.text}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;
