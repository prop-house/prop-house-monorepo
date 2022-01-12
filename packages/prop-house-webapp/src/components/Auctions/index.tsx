import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import AuctionHeader from '../AuctionHeader';
import FullAuction, { AuctionStatus } from '../FullAuction';
import { StatusPillState } from '../StatusPill';


const AuctionPartial = (auction: StoredAuction, i: number) => (
  <div key={i}>
  {i === 0 ? (
      <FullAuction
        auction={auction}
      />
  ): (
      <AuctionHeader
        auction={auction}
      />
  )}
  </div>
)

const Auctions = () => {
  const auctions = useAppSelector(state => state.propHouse.auctions)
  return (
    <>
      {
        auctions.map(AuctionPartial)
      }
      {/* <FullAuction
        showAllProposals={false}
        status={AuctionStatus.AcceptingProposals}
      />
      <AuctionHeader
        id={2}
        fundingAmount={10}
        startDate={Date.now()}
        endDate={Date.now()}
        status={StatusPillState.AuctionNotStarted}
      />
      <AuctionHeader
        id={3}
        fundingAmount={20}
        startDate={Date.now()}
        endDate={Date.now()}
        status={StatusPillState.AuctionNotStarted}
      /> */}
    </>
  );
};

export default Auctions;
