import classes from './OpenGraphHouseCard.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import CommunityProfImg from '../CommunityProfImg';
// import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { House, usePropHouse } from '@prophouse/sdk-react';
import getHouseCurrency from '../../utils/getHouseCurrency';
import TruncateThousands from '../TruncateThousands';

const OpenGraphHouseCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [house, setHouse] = useState<House>();

  const propHouse = usePropHouse();
  // const { data: signer } = useSigner();

  // const host = useAppSelector(state => state.configuration.backendHost);
  // const client = useRef(new PropHouseWrapper(host));
  // const houseCurrency = community && getHouseCurrency(community.contractAddress);

  // useEffect(() => {
  //   client.current = new PropHouseWrapper(host, signer);
  // }, [signer, host]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      // TODO: getHouseByAddress?
      // const house = await propHouse.query.getHouse(Number(id));


      
      // const community = await client.current.getCommunityWithId(Number(id));
      setHouse(house);
    };
    fetch();
  }, [id]);

  return (
    <>
      {house && (
        <div className={classes.cardContainer}>
          <div className={classes.logo}>
            <img src="/bulb.png" alt="bulb" />
            <span className={classes.propText}>Prop</span>{' '}
            <span className={classes.houseText}>House</span>
          </div>

          <span className={classes.infoAndImage}>
            <span className={classes.houseImg}>
              <CommunityProfImg community={house} />
            </span>

            <span className={classes.houseInfoCountainer}>
              <div className={classes.roundName}>{house.name}</div>

              <span className={classes.roundInfoContainer}>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Rounds</span>
                  <p className={classes.subtitle}>{house.roundCount}</p>
                </div>

                <div className={classes.roundInfo}>
                  <span className={classes.title}>Proposals</span>
                  {/* TODO: Not present on this query */}
                  {/* <p className={classes.subtitle}>{house.numProposals ?? 0}</p> */}
                </div>
                {/* <div className={classes.roundInfo}>
                  <span className={classes.title}>Funded</span>
                  <p className={classes.subtitle}>
                    <TruncateThousands
                      amount={houseCurrency === 'Ξ' ? community.ethFunded : community.totalFunded}
                    />{' '}
                    {houseCurrency}
                  </p>
                </div> */}
              </span>
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphHouseCard;
