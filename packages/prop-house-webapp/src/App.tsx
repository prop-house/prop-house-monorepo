import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import CreateProp from './pages/CreateProp';
import Footer from './components/Footer';
import './App.css';
import FAQ from './pages/FAQ';
import LoadingIndicator from './components/LoadingIndicator';
import NotFound from './components/NotFound';
import clsx from 'clsx';
import OpenGraphHouseCard from './components/OpenGraphHouseCard';
import OpenGraphRoundCard from './components/OpenGraphRoundCard';
import OpenGraphProposalCard from './components/OpenGraphProposalCard';
import Proposal from './pages/Proposal';
import { createConfig, configureChains, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  connectorsForWallets,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { PropHouseProvider } from '@prophouse/sdk-react';
import '@rainbow-me/rainbowkit/styles.css';
import CreateRound from './pages/CreateRound';
import MainApp from './pages/MainApp';
import RoundOrHouseRouter from './components/RoundOrHouseRouter';
import bgColorFor, { BgColorElement } from './utils/bgColorFor';
import Manage from './pages/Manage';
import RoundManager from './pages/RoundManager';
import Communities from './pages/Communities';

const { chains, publicClient } = configureChains([goerli], [publicProvider()]);

const { wallets } = getDefaultWallets({
  appName: 'Prop House',
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID!,
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  const location = useLocation();

  const [noActiveCommunity, setNoActiveCommunity] = useState(false);

  useEffect(() => {
    setNoActiveCommunity(false);

    if (!location.state) {
      setNoActiveCommunity(true);
    }
  }, [noActiveCommunity, location.state]);

  const openGraphCardPath = new RegExp('.+?/card').test(location.pathname);

  return (
    <>
      <WagmiConfig config={config}>
        {openGraphCardPath ? (
          <Routes>
            <Route path="/proposal/:id/card" element={<OpenGraphProposalCard />} />
            <Route path="/round/:id/card" element={<OpenGraphRoundCard />} />
            <Route path="/house/:id/card" element={<OpenGraphHouseCard />} />
          </Routes>
        ) : (
          <PropHouseProvider>
            <RainbowKitProvider
              chains={chains}
              theme={lightTheme({
                accentColor: 'var(--brand-purple)',
              })}
              initialChain={goerli}
            >
              <Suspense fallback={<LoadingIndicator />}>
                <div className={clsx(bgColorFor(BgColorElement.App, location.pathname), 'wrapper')}>
                  <NavBar />
                  <Routes>
                    <Route path="/" element={<MainApp />} />
                    <Route path="/:roundOrHouse" element={<RoundOrHouseRouter />} />
                    <Route path="/:round/:id" element={<Proposal />} />
                    <Route path="/create-prop" element={<CreateProp />} />
                    <Route path="/create-round" element={<CreateRound />} />
                    <Route path="/manage" element={<Manage />} />
                    <Route path="/manage/:address" element={<RoundManager />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <Footer />
                </div>
              </Suspense>
            </RainbowKitProvider>
          </PropHouseProvider>
        )}
      </WagmiConfig>
    </>
  );
}

export default App;
