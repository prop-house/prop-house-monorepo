import classes from './OpenGraphHouseCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import CommunityProfImg from '../CommunityProfImg';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import getHouseCurrency from '../../utils/getHouseCurrency';
import TruncateThousands from '../TruncateThousands';
import { useSigner } from 'wagmi';
import { Signer } from 'ethers';

const OpenGraphHouseCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [community, setCommunity] = useState<Community>();

  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const houseCurrency = community && getHouseCurrency(community.contractAddress);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer as Signer);
  }, [signer, host]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const community = await client.current.getCommunityWithId(Number(id));
      setCommunity(community);
    };
    fetch();
  }, [id]);

  return (
    <>
      {community && (
        <div className={classes.cardContainer}>
          <div className={classes.logo}>
            <img src="/bulb.png" alt="bulb" />
            <span className={classes.propText}>Prop</span>{' '}
            <span className={classes.houseText}>House</span>
          </div>

          <span className={classes.infoAndImage}>
            <span className={classes.houseImg}>
              <CommunityProfImg community={community} />
            </span>

            <span className={classes.houseInfoCountainer}>
              <div className={classes.roundName}>{community.name}</div>

              <span className={classes.roundInfoContainer}>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Rounds</span>
                  <p className={classes.subtitle}>{community.numAuctions ?? 0}</p>
                </div>

                <div className={classes.roundInfo}>
                  <span className={classes.title}>Proposals</span>
                  <p className={classes.subtitle}>{community.numProposals ?? 0}</p>
                </div>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Funded</span>
                  <p className={classes.subtitle}>
                    <TruncateThousands
                      amount={houseCurrency === 'Ξ' ? community.ethFunded : community.totalFunded}
                    />{' '}
                    {houseCurrency}
                  </p>
                </div>
              </span>
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphHouseCard;
