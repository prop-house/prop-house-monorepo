import HomeHeader from "../../HomeHeader";
import Auctions from "../../Auctions";
import CreateAuction from "../../CreateAuction";
import AdminTool from "../../AdminTool";

const Home = () => {
  return (
    <>
      <HomeHeader />
      <Auctions />
      {/* Hacked in auction create for development */}
      <AdminTool>
        <CreateAuction />
      </AdminTool>
    </>
  );
};

export default Home;
