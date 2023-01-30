import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  Auction,
  Community,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import classes from './OpenGraphProposalCard.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { InfuraProvider } from '@ethersproject/providers';
import getImageFromDescription from '../../utils/getImageFromDescription';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [proposal, setProposal] = useState<StoredProposalWithVotes>();
  const [round, setRound] = useState<Auction>();
  const [community, setCommunity] = useState<Community>();
  const [ens, setEns] = useState<null | string>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(backendHost));

  useEffect(() => {
    client.current = new PropHouseWrapper(backendHost);
  }, [backendHost]);

  useEffect(() => {
    if (!proposal || !process.env.REACT_APP_INFURA_PROJECT_ID) return;

    const lookUpEns = async () => {
      const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
      const ens = await provider.lookupAddress(proposal.address);
      setEns(ens);
    };
    lookUpEns();
  }, [proposal]);

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

  useEffect(() => {
    if (proposal) {
      const getImg = async () => setImageUrl(await getImageFromDescription(proposal));

      getImg();
    }
  }, [proposal]);

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

          <span className={classes.infoAndImage}>
            <div className={classes.userInfo}>
              <span className={classes.proposedBy}>Proposed by</span>
              <div className={classes.openGraphAvatar}>
                {ens ? ens : trimEthAddress(proposal.address)}
              </div>
            </div>

            {imageUrl && (
              <div className={classes.propImgContainer}>
                <img src={imageUrl} alt="propImage" />
              </div>
            )}
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphProposalCard;
