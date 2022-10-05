import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  Auction,
  Community,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import EthAddress from '../EthAddress';
import classes from './OpenGraphProposalCard.module.css';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [proposal, setProposal] = useState<StoredProposalWithVotes>();
  const [round, setRound] = useState<Auction>();
  const [community, setCommunity] = useState<Community>();

  const { library: provider } = useEthers();
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  useEffect(() => {
    client.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const proposal = (await client.current.getProposal(Number(id))) as StoredProposalWithVotes;
      const round = await client.current.getAuction(proposal.auctionId);
      const community = await client.current.getCommunityWithId(round.community);

      setProposal(proposal);
      setRound(round);
      setCommunity(community);
    };

    fetch();
  }, [id]);

  return (
    <>
      {community && round && proposal && (
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
