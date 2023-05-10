import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  TimedAuction,
  Community,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import classes from './OpenGraphProposalCard.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { InfuraProvider } from '@ethersproject/providers';
import AddressAvatar from '../AddressAvatar';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [proposal, setProposal] = useState<StoredProposalWithVotes>();
  const [round, setRound] = useState<TimedAuction>();
  const [community, setCommunity] = useState<Community>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [ens, setEns] = useState<null | string>(null);

  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(backendHost));

  useEffect(() => {
    client.current = new PropHouseWrapper(backendHost);
  }, [backendHost]);

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
    if (!proposal || !process.env.REACT_APP_INFURA_PROJECT_ID) return;

    const lookUpEns = async () => {
      const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
      const ens = await provider.lookupAddress(proposal.address);
      setEns(ens);
    };

    lookUpEns();

    const getImg = async () => setImageUrl(await getFirstImageFromProp(proposal));

    getImg();
  }, [proposal]);

  return (
    <>
      {community && round && proposal && (
        <div className={classes.cardContainer}>
          <span>
            <div className={classes.cardTitle}>
              <div className={classes.houseImg}>
                <img src={community.profileImageUrl} alt={community.name} />
              </div>
              <span className={classes.roundName}>{round.title}</span>
            </div>

            <span className={classes.infoAndImage}>
              <div className={classes.propNameContainer}>
                <div className={classes.propName}>{proposal.title}</div>
              </div>

              {imageUrl && (
                <div className={classes.propImgContainer}>
                  <img src={imageUrl} crossOrigin="anonymous" alt="propImage" />
                </div>
              )}
            </span>
          </span>

          <div className={classes.userInfo}>
            <AddressAvatar address={proposal.address} size={64} />

            <span>
              <span className={classes.proposedBy}>Proposed by</span>
              <div className={classes.proposerAddress}>
                {ens ? ens : trimEthAddress(proposal.address)}
              </div>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default OpenGraphProposalCard;
