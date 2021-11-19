import FullAuction from '../../FullAuction';
import BrowseControl from '../../BrowseControl';

const Browse = () => {
  return (
    <>
      <BrowseControl />
      <FullAuction showAllProposals={true} />
    </>
  );
};

export default Browse;
