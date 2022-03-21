import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../hooks';
import { findProposalById } from '../../../utils/findProposalById';
import extractAllProposals from '../../../utils/extractAllProposals';
import NotFound from '../NotFound';
import { findAuctionById } from '../../../utils/findAuctionById';
import FullProposal from '../../FullProposal';
import { useEffect, useRef } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { setActiveProposal } from '../../../state/slices/propHouse';
import classes from './Proposal.module.css';

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
  const backendClient = useRef(
    new PropHouseWrapper(backendHost, provider?.getSigner())
  );

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(
      backendHost,
      provider?.getSigner()
    );
  }, [provider, backendHost]);

  useEffect(() => {
    if (!proposal) return;
    backendClient.current
      .getProposal(proposal.id)
      .then((proposal) => dispatch(setActiveProposal(proposal)));
  }, [proposal, dispatch]);

  return (
    <>
      <Link
        to={`/auction/${parentAuction?.id}`}
        className={classes.backToAuction}
      >{`← Auction ${parentAuction?.id}`}</Link>

      {proposal ? (
        <FullProposal
          proposal={proposal}
          votingWrapper={backendClient.current}
        />
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Proposal;
