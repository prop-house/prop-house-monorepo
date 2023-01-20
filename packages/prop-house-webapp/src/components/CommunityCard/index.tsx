import classes from './CommunityCard.module.css';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';
import { useTranslation } from 'react-i18next';
import TruncateThousands from '../TruncateThousands';
import getHouseCurrency from '../../utils/getHouseCurrency';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../hooks';
import getTotalEthFunded from '../../utils/getTotalEthFunded';

const CommunityCard: React.FC<{
  community: Community;
}> = props => {
  const { community } = props;
  const { t } = useTranslation();

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const [totalFunded, setTotalFunded] = useState(0);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community rounds
  useEffect(() => {
    const getEthRounds = async () => {
      const communityRounds = await client.current.getAuctionsForCommunity(community.id);

      setTotalFunded(getTotalEthFunded(communityRounds));
    };

    // if house currency is ETH, filter out the rounds that didn't give ETH,
    // and return total sum across rounds that did give ETH
    if (getHouseCurrency(community.contractAddress) === 'Ξ') {
      getEthRounds();
    } else {
      // otherwise, use the given total funded amount value (ie. Meebits house returns total # of APE distributed)
      setTotalFunded(community.ethFunded);
    }
  }, [community.contractAddress, community.ethFunded, community.id, totalFunded]);

  return (
    <div className={classes.container}>
      <CommunityProfImg community={community} />
      <div className={classes.title}>{community.name}</div>
      <div className={classes.infoContainer}>
        <hr className={classes.divider} />
        <div className={classes.cardInfo}>
          <div className={classes.infoWithSymbol}>
            <div className={classes.infoText}>
              <span className={classes.infoAmount}>
                <TruncateThousands amount={totalFunded} />{' '}
                {getHouseCurrency(community.contractAddress)}
              </span>{' '}
              <span className={classes.infoCopy}>{t('funded')}</span>
            </div>
          </div>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.numAuctions}</span>{' '}
            <span className={classes.infoCopy}>
              {community.numAuctions === 1 ? t('round') : t('rounds')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
