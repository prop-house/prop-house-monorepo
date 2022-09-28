import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import RoundHeader from '../../RoundHeader';
import { useEffect, useRef } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { setActiveCommunity, setActiveRound } from '../../../state/slices/propHouse';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundMessage from '../../RoundMessage';
import RoundUtilityBar from '../../RoundUtilityBar';
import FullRound from '../../FullRound';
import { nameToSlug, slugToName } from '../../../utils/communitySlugs';

const Round = () => {
  const location = useLocation();
  const communityName = location.pathname.substring(1).split('/')[0];
  const roundName = location.pathname.substring(1).split('/')[1];

  const dispatch = useAppDispatch();
  const { library } = useEthers();

  const round = useAppSelector(state => state.propHouse.activeRound);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // if no round is found in store (ie round page is entry point), fetch community and round
  useEffect(() => {
    const fetchCommunityAndRound = async () => {
      const community = await client.current.getCommunityWithName(slugToName(communityName));
      const round = await client.current.getAuctionWithNameForCommunity(
        nameToSlug(roundName),
        community.id,
      );
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    if (!round) fetchCommunityAndRound();
  }, [communityName, dispatch, roundName, round]);

  return (
    <>
      <Container>
        {community && round && <RoundHeader auction={round} community={community} />}
      </Container>

      {round && (
        <div className={classes.stickyContainer}>
          <Container>
            <RoundUtilityBar auction={round} />
          </Container>
        </div>
      )}

      <div style={{ background: '#f5f5f5' }}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {round ? <FullRound auction={round} /> : <RoundMessage message="No rounds available" />}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
