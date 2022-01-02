import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/css/globals.css";
import NavBar from "./components/NavBar";
import Home from "./components/pages/Home";
import Browse from "./components/pages/Browse";
import Learn from "./components/pages/Learn";
import Create from "./components/pages/Create";
import NotFound from "./components/pages/NotFound";
import Footer from "./components/Footer";
import { Container } from "react-bootstrap";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./hooks";
import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { addAuctions } from "./state/slices/propHouse";
import { Mainnet, DAppProvider, Config, useEthers } from "@usedapp/core";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import { useEffect } from "react";

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]:
      "https://mainnet.infura.io/v3/bb1bb1143055477dbe59879f4887516c",
  },
};

function App() {
  const dispatch = useAppDispatch();
  const { library: provider } = useEthers();
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  let backendClient = new PropHouseWrapper(backendHost, provider?.getSigner())

  useEffect(() => {
    backendClient = new PropHouseWrapper(backendHost, provider?.getSigner())
  }, [provider, backendHost])

  // Fetch initial auctions
 backendClient 
    .getAuctions()
    .then((auctions: StoredAuction[]) => dispatch(addAuctions(auctions)));

  return (
    <DAppProvider config={config}>
      <Container>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/create" element={<Create />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Container>
    </DAppProvider>
  );
}

export default App;
