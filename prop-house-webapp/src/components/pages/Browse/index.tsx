import FullAuction, { AuctionStatus } from '../../FullAuction';
import BrowseControl from '../../BrowseControl';

const Browse = () => {
  return (
    <>
      <BrowseControl />
      <FullAuction showAllProposals={true} status={AuctionStatus.Voting} />
    </>
  );
};

export default Browse;
