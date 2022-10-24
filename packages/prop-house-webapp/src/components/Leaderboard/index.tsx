import classes from './Leaderboard.module.css';
import Section from '../../layout/Section';
import { useQuery } from '@apollo/client';
import { leaderboard } from '../../wrappers/subgraph';
import ShortAddress from '../ShortAddress';
import { buildEtherscanAddressLink } from '../../utils/etherscan';
import Link from '../Link';
import { Table } from 'react-bootstrap';

interface LeaderboardPageProps {
  tops?: number;
}

const Leaderboard: React.FC<LeaderboardPageProps> = props => {
  const { tops } = props;
  const isMobile = window.innerWidth < 992;
  const { loading, error, data } = useQuery(leaderboard(tops || 10));

  if (loading) {
    return (
      <div>
        <b>loading...</b>
      </div>
    );
  } else if (error) {
    return (
      <div>
        <b>error...</b>
      </div>
    );
  }

  return (
    <Section fullWidth={false} className={classes.wrapper}>
      <div style={{ textAlign: 'center' }}>
        <h1>FOODNOUNS DAO LEADERBOARD</h1>
        <h2>ADDRESSES BY VOTING WEIGHT</h2>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Table borderless style={{ alignSelf: 'center', width: 800 }}>
          <tr>
            <th>#</th>
            <th>Rank</th>
            <th style={{ textAlign: 'center' }}>Votes</th>
            <th style={{ textAlign: 'center' }}>Vote Weight</th>
            <th style={{ textAlign: 'center' }}>Proposals Voted</th>
          </tr>

          {data.delegates.map((item: any, index: number) => (
            <tr>
              <td>{index + 1}</td>
              <td>
                <ShortAddress
                  address={item.id}
                  avatar={isMobile ? false : true}
                  link={buildEtherscanAddressLink(item.id)}
                />
              </td>
              <td style={{ textAlign: 'center' }}>{item.delegatedVotes}</td>
              <td style={{ textAlign: 'center' }}>
                {((item.delegatedVotes / data.auctions[0]?.noun?.id) * 100).toFixed(2)} %
              </td>
              <td style={{ textAlign: 'center' }}>{item.votes.length}</td>
            </tr>
          ))}
        </Table>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Link text=">>> See All Leaderboard <<<" url="/leaderboard" leavesPage={false} />
      </div>
    </Section>
  );
};
export default Leaderboard;
