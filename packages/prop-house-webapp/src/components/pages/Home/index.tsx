import HomeHeader from "../../HomeHeader";
import CommunityCarousel from "../../CommunityCarousel";
import PropCarousel from "../../PropCarousel";
import ContactUsCTA from "../../ContactUsCTA";
import { Suspense } from "react";
import LoadingIndicator from "../../LoadingIndicator";

const Home = () => {
  return (
    <>
      <Suspense fallback={<LoadingIndicator />}>
        <HomeHeader />
        <CommunityCarousel />
        <PropCarousel />
        <ContactUsCTA />
      </Suspense>
    </>
  );
};

export default Home;
