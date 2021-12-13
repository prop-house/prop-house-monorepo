import HomeHeader from '../../HomeHeader';
import Auctions from '../../Auctions';
import CreateAuction from '../../CreateAuction';

const Home = () => {
  return (
    <>
      <HomeHeader />
      <Auctions />
      {/* Hacked in auction create for development */}
      <CreateAuction />
    </>
  );
};

export default Home;
