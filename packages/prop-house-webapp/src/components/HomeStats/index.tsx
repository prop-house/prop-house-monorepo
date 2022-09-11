import classes from './HomeStats.module.css';

import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useRef, useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import CountUp from 'react-countup';

interface HomeStatsProps {
  totalFundedEth: number;
}

const HomeStats = ({ totalFundedEth }: HomeStatsProps) => {
  const { library } = useEthers();
  const dispatch = useDispatch();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [stats, setStats] = useState({
    votes: 0,
    props: 0,
  });

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAllProposals();

      proposals &&
        setStats({
          ...stats,
          votes: proposals
            .map((proposal: StoredProposalWithVotes) => proposal.votes)
            .flat()
            .reduce((a: number, b: number) => a + b, 0),
          props: proposals.length,
        });
    };
    fetchAuctionProposals();
  }, [dispatch]);

  return (
    <div className={classes.statsContainer}>
      <div className={classes.stat}>
        <CountUp start={0} end={totalFundedEth}>
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
