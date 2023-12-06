import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import CreateProp from './pages/CreateProp';
import Footer from './components/Footer';
import './App.css';
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
import Dashboard from './pages/Dashboard';
import RoundManager from './pages/RoundManager';
import Communities from './pages/Communities';
import Home from './pages/Home';
import HouseManager from './pages/HouseManager';

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
  const showMakeAppHomePage = localStorage.getItem('makeAppHomePage');

  return (
    <>
      <WagmiConfig config={config}>
        <PropHouseProvider>
          {openGraphCardPath ? (
            <Routes>
              <Route path="/proposal/:address/:id/card" element={<OpenGraphProposalCard />} />
              <Route path="/round/:address/card" element={<OpenGraphRoundCard />} />
              <Route path="/house/:address/card" element={<OpenGraphHouseCard />} />
            </Routes>
          ) : (
            <RainbowKitProvider
              chains={chains}
              theme={lightTheme({
                accentColor: 'var(--brand-purple)',
              })}
              initialChain={goerli}
            >
              <Suspense fallback={<LoadingIndicator />}>
                <div
                  className={clsx(bgColorFor(BgColorElement.Home, location.pathname), 'wrapper')}
                >
                  <NavBar />
                  <Routes>
                    <Route
                      path="/"
                      element={showMakeAppHomePage === 'yes' ? <MainApp /> : <Home />}
                    />
                    <Route path="/app" element={<MainApp />} />
                    <Route path="/:roundOrHouse" element={<RoundOrHouseRouter />} />
                    <Route path="/manage/round/:address" element={<RoundManager />} />
                    <Route path="/manage/house/:address" element={<HouseManager />} />
                    <Route path="/:round/:id" element={<Proposal />} />
                    <Route path="/create-prop" element={<CreateProp />} />
                    <Route path="/create-round" element={<CreateRound />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <Footer />
                </div>
              </Suspense>
            </RainbowKitProvider>
          )}
        </PropHouseProvider>
      </WagmiConfig>
    </>
  );
}

export default App;
