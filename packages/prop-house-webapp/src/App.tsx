import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Create from './pages/Create';
import House from './pages/House';
import Footer from './components/Footer';
import './App.css';
import FAQ from './pages/FAQ';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotFound from './components/NotFound';
import Round from './pages/Round';
import bgColorForPage from './utils/bgColorForPage';
import clsx from 'clsx';
import OpenGraphHouseCard from './components/OpenGraphHouseCard';
import OpenGraphRoundCard from './components/OpenGraphRoundCard';
import OpenGraphProposalCard from './components/OpenGraphProposalCard';
import Proposal from './pages/Proposal';
import { createClient, mainnet, configureChains, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import StatusRoundCards from './components/StatusRoundCards';
import CreateRound from './pages/CreateRound';
import { base } from './types/base';
import Banner from './components/Banner';
import HouseManager from './components/pages/HouseManager';

const { chains, provider } = configureChains(
  [mainnet, base],
  [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_PROJECT_ID! }), publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: 'Prop House',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
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

  const bannerContent = (
    <>
      <a href="/base" rel="noreferrer">
        Onchain Summer is here! Close to 100 ETH in grants are available for those building on Base.{' '}
        <b>View the rounds →</b>
      </a>
    </>
  );

  const openGraphCardPath = new RegExp('.+?/card').test(location.pathname);
  const noNavPath =
    location.pathname === '/' || location.pathname === '/faq' || location.pathname === '/create';

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        {openGraphCardPath ? (
          <Routes>
            <Route path="/proposal/:id/card" element={<OpenGraphProposalCard />} />
            <Route path="/round/:id/card" element={<OpenGraphRoundCard />} />
            <Route path="/house/:id/card" element={<OpenGraphHouseCard />} />
          </Routes>
        ) : (
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: 'var(--brand-purple)',
            })}
          >
            <Suspense fallback={<LoadingIndicator />}>
              <div className={clsx(bgColorForPage(location.pathname), 'wrapper')}>
                {location.pathname === '/' && <Banner content={bannerContent} />}
                {!noNavPath && <NavBar />}

                <Routes>
                  <Route path="/rounds" element={<StatusRoundCards />} />
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute noActiveCommunity={noActiveCommunity}>
                        <Create />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/create-round" element={<CreateRound />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/admin" element={<HouseManager />} />
                  <Route path="/proposal/:id" element={<Proposal />} />
                  <Route path="/:house" element={<House />} />
                  <Route path="/:house/:title" element={<Round />} />
                  <Route path="/:house/:title/:id" element={<Proposal />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>

                <Footer />
              </div>
            </Suspense>
          </RainbowKitProvider>
        )}
      </WagmiConfig>
    </>
  );
}

export default App;
