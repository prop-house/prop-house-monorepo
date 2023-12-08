import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classes from './OpenGraphProposalCard.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import { InfuraProvider } from '@ethersproject/providers';
import AddressAvatar from '../AddressAvatar';
import { House, Proposal, Round, usePropHouse } from '@prophouse/sdk-react';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const propHouse = usePropHouse();
  const { address, id } = params;

  const [proposal, setProposal] = useState<Proposal>();
  const [round, setRound] = useState<Round>();
  const [house, setHouse] = useState<House>();
  const [ens, setEns] = useState<null | string>(null);

  useEffect(() => {
    if (!address || !id) return;

    const fetch = async () => {
      const proposal = await propHouse.query.getProposal(address, Number(id));
      const round = await propHouse.query.getRoundWithHouseInfo(address);
      setProposal(proposal);
      setRound(round);
      setHouse(round.house);
    };

    fetch();
  }, [address, id, propHouse.query]);

  useEffect(() => {
    if (!proposal || !process.env.REACT_APP_INFURA_PROJECT_ID) return;

    const lookUpEns = async () => {
      const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
      const ens = await provider.lookupAddress(proposal.proposer);
      setEns(ens);
    };

    lookUpEns();
  }, [proposal]);

  return (
    <>
      {house && round && proposal && (
        <div className={classes.cardContainer}>
          <span>
            <div className={classes.cardTitle}>
              <div className={classes.houseImg}>
                <img src={house.imageURI} alt={house.name} crossOrigin="anonymous" />
              </div>
              <span className={classes.roundName}>{round.title}</span>
            </div>

            <span className={classes.infoAndImage}>
              <div className={classes.propNameContainer}>
                <div className={classes.propName}>{proposal.title}</div>
              </div>
            </span>
          </span>

          <div className={classes.userInfo}>
            <AddressAvatar address={proposal.proposer} size={64} />
            <span>
              <span className={classes.proposedBy}>Proposed by</span>
              <div className={classes.proposerAddress}>
                {ens ? ens : trimEthAddress(proposal.proposer)}
              </div>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default OpenGraphProposalCard;
