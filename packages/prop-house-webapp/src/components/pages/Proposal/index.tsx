import HomeHeader from "../../HomeHeader";
import Auctions from "../../Auctions";
import CreateAuction from "../../CreateAuction";
import AdminTool from "../../AdminTool";
import { useParams } from "react-router";
import { useAppSelector } from "../../../hooks";
import { findProposalById } from "../../../utils/findProposalById";
import extractAllProposals from "../../../utils/extractAllProposals";
import NotFound from "../NotFound";
import { findAuctionById } from "../../../utils/findAuctionById";
import AuctionHeader from "../../AuctionHeader";
import FullProposal from "../../FullProposal";

const Proposal = () => {
  const params = useParams();
  const {id} = params;

  const {proposal, parentAuction} = useAppSelector(state => {
    const proposal = findProposalById(Number(id), extractAllProposals(state.propHouse.auctions))
    const parentAuction = proposal && findAuctionById(proposal.auctionId, state.propHouse.auctions);
    console.log(proposal?.auctionId)
    return {proposal, parentAuction}
  })

  console.log(id, proposal, parentAuction)
  return (
    <>
    {parentAuction && <AuctionHeader auction={parentAuction}/>}
    {proposal ? <FullProposal proposal={proposal} /> : <NotFound />}

    </>
  );
};

export default Proposal;
