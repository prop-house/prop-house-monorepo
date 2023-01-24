import classes from './HomeStats.module.css';
import CountUp from 'react-countup';
import { StatsProps } from '../../pages/Home';
import { useState } from 'react';
import TruncateThousands from '../TruncateThousands';
import { useTranslation } from 'react-i18next';

interface HomeStatsProps {
  stats: StatsProps;
}

const HomeStats = ({ stats }: HomeStatsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const onEnd = () => {
    setLoading(true);
  };

  const homeStats = [
    {
      amount: stats.accEthFunded,
      text: t('ethFunded'),
    },
    {
      amount: stats.accRounds,
      text: `${stats.accRounds === 1 ? t('fundingRoundCap') : t('fundingRoundsCap')}`,
    },
    {
      amount: stats.accProps,
      text: `${stats.accProps === 1 ? t('submittedProp') : t('submittedProps')}`,
    },
  ];

  return (
    <div className={classes.statsContainer}>
      {homeStats.map(s => (
        <div className={classes.stat}>
          {!loading ? (
            <CountUp start={0} end={s.amount} suffix="+" delay={0} onEnd={onEnd}>
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
