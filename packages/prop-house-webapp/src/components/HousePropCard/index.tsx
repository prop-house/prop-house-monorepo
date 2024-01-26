import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Proposal } from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import classes from './HousePropCard.module.css';
import { replaceIpfsGateway } from '../../utils/ipfs';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { MdHowToVote } from 'react-icons/md';

const HousePropCard: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const navigate = useNavigate();

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);

  useEffect(() => {
    let imgUrl;
    const getImg = async () => {
      imgUrl = await getFirstImageFromProp(proposal);
      setImgUrlFromProp(imgUrl);
    };
    getImg();
  }, [proposal]);
  return (
    <div onClick={() => navigate(`/${proposal.round}/${proposal.id}`)}>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={classes.propCard}
      >
        <div className={classes.propCardHeader}>
          <EthAddress address={proposal.proposer} addAvatar className={classes.proposer} />
          <div className={classes.voteDisplay}>
            <MdHowToVote />
            {proposal.votingPower}
          </div>
        </div>
        <h5 className={classes.propTitle}>{proposal.title}</h5>

        {imgUrlFromProp ? (
          <div className={classes.propImgContainer}>
            <img
              src={replaceIpfsGateway(imgUrlFromProp)}
              crossOrigin="anonymous"
              alt="propCardImage"
            />
          </div>
        ) : (
          <p>{proposal.tldr}</p>
        )}
      </Card>
    </div>
  );
};
export default HousePropCard;
