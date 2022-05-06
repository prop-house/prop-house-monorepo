import CommunityCard from '../CommunityCard';
import CarouselSection from '../CarouselSection';

const CommunityCarousel = () => {
  const cards = [
    <CommunityCard numProposals={44} />,
    <CommunityCard numProposals={34} />,
    <CommunityCard numProposals={444} />,
    <CommunityCard numProposals={14} />,
    <CommunityCard numProposals={44} />,
    <CommunityCard numProposals={44} />,
    <CommunityCard numProposals={34} />,
    <CommunityCard numProposals={444} />,
    <CommunityCard numProposals={14} />,
    <CommunityCard numProposals={44} />,
  ];

  return (
    <CarouselSection
      contextTitle="Browse communities"
      mainTitle="Explore commmunity prop houses "
      cards={cards}
    />
  );
};

export default CommunityCarousel;
