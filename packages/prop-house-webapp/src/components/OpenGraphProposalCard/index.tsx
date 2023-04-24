import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classes from './OpenGraphProposalCard.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { InfuraProvider } from '@ethersproject/providers';
import { House, Proposal, Round, usePropHouse } from '@prophouse/sdk-react';
import AddressAvatar from '../AddressAvatar';

const OpenGraphProposalCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [proposal, setProposal] = useState<Proposal>();
  const [round, setRound] = useState<Round>();
  const [community, setCommunity] = useState<House>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [ens, setEns] = useState<null | string>(null);

  const propHouse = usePropHouse();
  
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const roundAddress = ''; // TODO: Must pass this in alongside the proposal id.
      const proposal = await propHouse.query.getProposal(roundAddress, Number(id));
      const round = await propHouse.query.getRoundWithHouseInfo(roundAddress);

      setProposal(proposal);
      setRound(round);
      setCommunity(round.house);
    };

    fetch();
  }, [id, propHouse.query]);

  useEffect(() => {
    if (!proposal || !process.env.REACT_APP_INFURA_PROJECT_ID) return;

    const lookUpEns = async () => {
      const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
      const ens = await provider.lookupAddress(proposal.proposer);
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
                <img src={community.imageURI} alt={community.name} />
              </div>
              <span className={classes.roundName}>{round.title}</span>
            </div>

            <span className={classes.infoAndImage}>
              <div className={classes.propNameContainer}>
                <div className={classes.propName}>{proposal.title}</div>
              </div>

              {imageUrl && (
                <div className={classes.propImgContainer}>
                  <img src={imageUrl} alt="propImage" />
                </div>
              )}
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
