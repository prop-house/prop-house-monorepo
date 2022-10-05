import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import {
  setActiveCommunity,
  setActiveProposal,
  setActiveRound,
} from '../../state/slices/propHouse';
import EthAddress from '../EthAddress';
import classes from './OpenGraphProposalCard.module.css';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const { id } = params;
  const { library: provider } = useEthers();

  const [failedFetch, setFailedFetch] = useState(false);

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id),
        )) as StoredProposalWithVotes;
        document.title = `${proposal.title}`;
        dispatch(setActiveProposal(proposal));
      } catch (e) {
        setFailedFetch(true);
      }
    };

    fetch();

    return () => {
      document.title = 'Prop House';
    };
  }, [id, dispatch, failedFetch]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getAuction(proposal.auctionId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

  return (
    <>
      {community && proposal && (
        <div className={classes.cardContainer}>
          <span>
            <div className={classes.cardTitle}>
              <span className={classes.houseName}>{community.name} House:</span>{' '}
              <span className={classes.roundName}>{round?.title} </span>
            </div>

            <div className={classes.propName}>{proposal.title}</div>
          </span>

          <div className={classes.userInfo}>
            <span className={classes.proposedBy}>Proposed by</span>
            <EthAddress
              imgSize={35}
              address={proposal.address}
              className={classes.openGraphAvatar}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OpenGraphProposalCard;
