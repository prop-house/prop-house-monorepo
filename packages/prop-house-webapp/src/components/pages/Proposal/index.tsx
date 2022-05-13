import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../hooks';
import NotFound from '../NotFound';
import FullProposal from '../../FullProposal';
import { useEffect, useRef } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import {
  setActiveCommunity,
  setActiveProposal,
} from '../../../state/slices/propHouse';
import classes from './Proposal.module.css';

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const dispatch = useDispatch();
  const proposal = useAppSelector((state) => state.propHouse.activeProposal);
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
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

  // fetch proposal
  useEffect(() => {
    if (!id) return;
    backendClient.current
      .getProposal(Number(id))
      .then((proposal) => dispatch(setActiveProposal(proposal)));
  }, [id, dispatch]);

  /**
   * when /proposal/:id is entry point, community is not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (community || !proposal || !proposal.auctionId) return;

    const fetchCommunity = async () => {
      const auction = await backendClient.current.getAuction(
        proposal.auctionId
      );
      const community = await backendClient.current.getCommunityWithId(
        auction.communityId
      );
      dispatch(setActiveCommunity(community));
    };

    fetchCommunity();
  }, [id, dispatch, proposal, community]);

  return (
    <>
      {proposal ? (
        <>
          <Link
            to={`/${community?.contractAddress}`}
            className={classes.backToAuction}
          >{`← Back to ${community?.name}`}</Link>
          <FullProposal
            proposal={proposal}
            votingWrapper={backendClient.current}
          />
        </>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Proposal;
