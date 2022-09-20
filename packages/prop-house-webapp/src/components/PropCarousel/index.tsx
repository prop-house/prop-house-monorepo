import classes from './PropCarousel.module.css';
import CarouselSection from '../CarouselSection';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useRef, useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import LoadingIndicator from '../LoadingIndicator';
import { useTranslation } from 'react-i18next';
import HomeProposalCard from '../HomeProposalCard';
import ProposalCard from '../ProposalCard';

const PropCarousel = () => {
  const { library } = useEthers();
  const dispatch = useDispatch();
  const [proposals, setProposals] = useState<StoredProposalWithVotes[]>();
  const [isLoading, setIsLoading] = useState(false);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch proposals
  useEffect(() => {
    setIsLoading(true);
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getProposals();
      setProposals(proposals);
      setIsLoading(false);
    };
    fetchAuctionProposals();
  }, [dispatch]);

  const propCards =
    proposals &&
    proposals
      .sort((a, b) => (a.createdDate > b.createdDate ? -1 : 1))
      .slice(0, 20)
      .map((_, index) => {
        return (
          <div className={classes.propCardContainer} key={index}>
            <HomeProposalCard fromHome proposal={proposals[index]} />
          </div>
        );
      });

  return isLoading ? (
    <LoadingIndicator />
  ) : (
    <CarouselSection
      contextTitle={t('browseProps')}
      mainTitle={t('recentProps')}
      cards={propCards || []}
    />
  );
};

export default PropCarousel;
