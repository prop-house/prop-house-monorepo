import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/css/globals.css";
import { Suspense } from "react";
import NavBar from "./components/NavBar";
import Home from "./components/pages/Home";
import Learn from "./components/pages/Learn";
import Create from "./components/pages/Create";
import Community from "./components/pages/Community";
import Proposal from "./components/pages/Proposal";
import Footer from "./components/Footer";
import { Container } from "react-bootstrap";
import "./App.css";
import { Mainnet, DAppProvider, Config } from "@usedapp/core";
import FAQ from "./components/pages/FAQ";
import Explore from "./components/pages/Explore";
import LoadingIndicator from "./components/LoadingIndicator";

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  },
  autoConnect: false,
};

function App() {
  return (
    <DAppProvider config={config}>
      <Suspense fallback={<LoadingIndicator />}>
        <Container>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/proposal/:id" element={<Proposal />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<Community />} />
          </Routes>
          <Footer />
        </Container>
      </Suspense>
    </DAppProvider>
  );
}

export default App;
