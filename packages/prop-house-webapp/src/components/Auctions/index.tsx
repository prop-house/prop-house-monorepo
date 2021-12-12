import AuctionHeader from '../AuctionHeader';
import FullAuction, { AuctionStatus } from '../FullAuction';
import { StatusPillState } from '../StatusPill';

const Auctions = () => {
  return (
    <>
      <FullAuction
        showAllProposals={false}
        status={AuctionStatus.AcceptingProposals}
      />
      <AuctionHeader
        id={2}
        fundingAmount={10}
        startDate={Date.now()}
        endDate={Date.now()}
        displayCreateButton={false}
        status={StatusPillState.AuctionNotStarted}
      />
      <AuctionHeader
        id={3}
        fundingAmount={20}
        startDate={Date.now()}
        endDate={Date.now()}
        displayCreateButton={false}
        status={StatusPillState.AuctionNotStarted}
      />
    </>
  );
};

export default Auctions;
