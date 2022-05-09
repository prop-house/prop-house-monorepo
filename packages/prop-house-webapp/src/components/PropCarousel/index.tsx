import classes from './PropCarousel.module.css';
import CarouselSection from '../CarouselSection';
import { useAppSelector } from '../../hooks';
import ProposalCard from '../ProposalCard';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useRef, useEffect } from 'react';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { setActiveProposals } from '../../state/slices/propHouse';

const PropCarousel = () => {
  const { library } = useEthers();
  const dispatch = useDispatch();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(1);
      dispatch(setActiveProposals(proposals));
    };
    fetchAuctionProposals();
  }, [dispatch]);

  console.log(proposals);

  const p =
    proposals &&
    proposals.map((proposal, index) => {
      return (
        <div className={classes.propCardContainer}>
          <ProposalCard proposal={proposal} />
        </div>
      );
    });

  return (
    <CarouselSection
      contextTitle="Browse proposals"
      mainTitle="Discover recent proposals "
      cards={p ? p : []}
    />
  );
};

export default PropCarousel;
