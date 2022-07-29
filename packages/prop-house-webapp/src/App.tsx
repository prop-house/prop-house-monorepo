import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import Learn from './components/pages/Learn';
import Create from './components/pages/Create';
import Community from './components/pages/Community';
import Proposal from './components/pages/Proposal';
import Footer from './components/Footer';
import { Container } from 'react-bootstrap';
import './App.css';
// import { Mainnet, DAppProvider, Config } from '@usedapp/core';
import FAQ from './components/pages/FAQ';
import Explore from './components/pages/Explore';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

//
import '@rainbow-me/rainbowkit/dist/index.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

//
//
//
const { chains, provider } = configureChains(
  [chain.mainnet],
  [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_PROJECT_ID }), publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});
//
//
//

// const config: Config = {
//   readOnlyChainId: Mainnet.chainId,
//   readOnlyUrls: {
//     [Mainnet.chainId]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
//   },
//   autoConnect: false,
// };

function App() {
  const location = useLocation();
  const [noActiveCommunity, setNoActiveCommunity] = useState(false);

  useEffect(() => {
    setNoActiveCommunity(false);

    if (!location.state) {
      setNoActiveCommunity(true);
    }
  }, [noActiveCommunity, location.state]);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {/* <DAppProvider config={config}> */}
        <Suspense fallback={<LoadingIndicator />}>
          <Container>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute noActiveCommunity={noActiveCommunity}>
                    <Create />
                  </ProtectedRoute>
                }
              />
              <Route path="/learn" element={<Learn />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/proposal/:id" element={<Proposal />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<Community />} />
            </Routes>
            <Footer />
          </Container>
        </Suspense>
        {/* </DAppProvider> */}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
