import { Container } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import FullAuction from '../FullAuction';
import { useEffect, useRef } from 'react';
import { nameToSlug, slugToName } from '../../utils/communitySlugs';
import { setActiveAuction, setActiveCommunity } from '../../state/slices/propHouse';
import { ethers } from 'ethers';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';

const Round = () => {
  const { state } = useLocation();
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const { house: slug, title } = useParams();

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

        // _????
        // if (cleanedUp.current) return; // assures late async call doesn't set state on unmounted comp

        dispatch(setActiveCommunity(community));

        title &&
          dispatch(
            setActiveAuction(
              ...community2.auctions.filter(
                r => nameToSlug(r.title.toString()) === nameToSlug(title),
              ),
            ),
          );
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
  }, [slug, isValidAddress, title, community, dispatch]);

  activeAuction && console.log('activeAuction', activeAuction);

  return (
    <>
      <div>
        <Container>
          {(state || activeAuction) && (
            <FullAuction auction={state ? state.round : activeAuction} />
          )}
        </Container>
      </div>
    </>
  );
};

export default Round;
