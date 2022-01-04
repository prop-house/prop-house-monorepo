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
import { useEffect } from "react";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import { useEthers } from "@usedapp/core";
import { useDispatch } from "react-redux";
import { setActiveProposal } from "../../../state/slices/propHouse";
import ProposalSignature from '../../ProposalSignature'
import classes from './Proposal.module.css'

const Proposal = () => {
  const params = useParams();
  const { id } = params;
  const dispatch = useDispatch();

  const { proposal, parentAuction } = useAppSelector((state) => {
    const proposal = findProposalById(
      Number(id),
      extractAllProposals(state.propHouse.auctions)
    );
    const parentAuction =
      proposal && findAuctionById(proposal.auctionId, state.propHouse.auctions);
    return { proposal, parentAuction };
  });

  const backendHost = useAppSelector(
    (state) => state.configuration.backendHost
  );
  const { library: provider } = useEthers();
  let backendClient = new PropHouseWrapper(backendHost, provider?.getSigner());

  useEffect(() => {
    backendClient = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  useEffect(() => {
    if (!proposal) return;
    backendClient
      .getProposal(proposal.id)
      .then((proposal) => dispatch(setActiveProposal(proposal)));
  }, [proposal]);

  return (
    <>
      {parentAuction && <AuctionHeader auction={parentAuction} />}
      {proposal ? (
        <div className={classes.proposal}>
        <ProposalSignature proposal={proposal} className={classes.check} />
        <FullProposal proposal={proposal} votingWrapper={backendClient} />
        </div>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Proposal;
