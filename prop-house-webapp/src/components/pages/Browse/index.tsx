import FullAuction from '../../FullAuction';
import BrowseControl from '../../BrowseControl';

const Browse = () => {
  return (
    <>
      <BrowseControl />
      <FullAuction showCreateProposalCTA={false} showAllProposals={true} />
    </>
  );
};

export default Browse;
