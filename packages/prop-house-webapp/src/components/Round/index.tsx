import { Container } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import FullAuction from '../FullAuction';

import { useEffect, useRef } from 'react';
import { slugToName } from '../../utils/communitySlugs';
import { setActiveAuction, setActiveCommunity } from '../../state/slices/propHouse';
import { ethers } from 'ethers';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';

const Round = () => {
  const { state } = useLocation();
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const { house: slug, id } = useParams();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const cleanedUp = useRef(false);
  const activeAuction = useAppSelector(state => state.propHouse.activeAuction);
  const dispatch = useAppDispatch();

  const isValidAddress = slug && ethers.utils.isAddress(slug);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // fetch by address or name

        const community2 = isValidAddress
          ? await client.current.getCommunity(slug)
          : await client.current.getCommunityWithName(slugToName(slug!));
        // console.log('community2', community2);
        // community.auctions.sort((a, b) => (dayjs(a.createdDate) < dayjs(b.createdDate) ? 1 : -1));

        // AuctionStatus.AuctionAcceptingProps
        // console.log(
        //   'c',
        //   community,
        //   community.auctions.filter(r => r.id.toString() === id),
        // );
        // if (cleanedUp.current) return; // assures late async call doesn't set state on unmounted comp

        dispatch(setActiveCommunity(community));

        // community2 &&
        //   console.log(
        //     'with',
        //     community2.auctions.filter(r => r.id.toString() === id),
        //   );
        // community2 &&
        //   console.log('without', ...community2.auctions.filter(r => r.id.toString() === id));

        // console.log('cafter', community);

        // const currentRound = community.auctions.filter(r => r.id.toString() === id);
        // console.log('currentRound', currentRound);
        // console.log(
        //   'cur2',
        //   community.auctions.filter(r => r.id === 6),
        // );

        dispatch(setActiveAuction(...community2.auctions.filter(r => r.id.toString() === id)));
      } catch (e) {
        console.log(e);
      }
    };
    fetchCommunity();
    return () => {
      cleanedUp.current = true;
      dispatch(setActiveCommunity());
      dispatch(setActiveAuction());
      // dispatch(setActiveProposals([]));
    };
  }, [slug, isValidAddress, id, community, dispatch]);

  activeAuction && console.log('activeAuction', activeAuction);

  return (
    <>
      <div>
        <Container>
          {/* <h1>{state.round.id}</h1>
        <h1>{state.round.title}</h1> */}
          {(state || activeAuction) && (
            <FullAuction auction={state ? state.round : activeAuction} />
          )}
        </Container>
      </div>
    </>
  );
};

export default Round;
