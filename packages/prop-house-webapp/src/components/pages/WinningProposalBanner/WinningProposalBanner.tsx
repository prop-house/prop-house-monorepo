import classes from './WinningProposalBanner.module.css';

const WinningProposalBanner: React.FC<{ numOfVotes: number }> = props => {
  const { numOfVotes } = props;

  return (
    <div className={classes.winnerBanner}>
      <p>
        This prop won with {Number(numOfVotes).toFixed()}{' '}
        {Number(numOfVotes).toFixed() === '1' ? 'vote' : 'votes'}!
      </p>
      <img src="/winner_banner.png" alt="winning-proposal" />
    </div>
  );
};

export default WinningProposalBanner;
