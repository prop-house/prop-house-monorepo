import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import Create from './components/pages/Create';
import House from './components/pages/House';
import Proposal from './components/pages/Proposal';
import Footer from './components/Footer';
import './App.css';
import { Mainnet, DAppProvider, Config } from '@usedapp/core';
import FAQ from './components/pages/FAQ';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotFound from './components/NotFound';
import Round from './components/pages/Round';
import bgColorForPage from './utils/bgColorForPage';
import clsx from 'clsx';
import OpenGraphProposalCard from './components/OpenGraphProposalCard';
import OpenGraphRoundCard from './components/OpenGraphRoundCard';

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  },
  autoConnect: true,
};

function App() {
  const location = useLocation();
  const [noActiveCommunity, setNoActiveCommunity] = useState(false);

  useEffect(() => {
    setNoActiveCommunity(false);

    if (!location.state) {
      setNoActiveCommunity(true);
    }
  }, [noActiveCommunity, location.state]);

  const socalCardPath = new RegExp('.+?/card').test(location.pathname);
  const noNavPath = socalCardPath || location.pathname === '/';

  return (
    <DAppProvider config={config}>
      <Suspense fallback={<LoadingIndicator />}>
        <div className={clsx(bgColorForPage(location.pathname), 'wrapper')}>
          {!noNavPath && <NavBar />}

          <Routes>
            <Route path="/proposal/:id/card" element={<OpenGraphProposalCard />} />
            <Route path="/:house/:round/card" element={<OpenGraphRoundCard />} />
            {/* <Route path="/:house/card" element={<>rendered card for house</>} /> */}

            <Route path="/" element={<Home />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute noActiveCommunity={noActiveCommunity}>
                  <Create />
                </ProtectedRoute>
              }
            />

            <Route path="/faq" element={<FAQ />} />
            <Route path="/proposal/:id" element={<Proposal />} />
            <Route path="/:house" element={<House />} />
            <Route path="/:house/:title" element={<Round />} />
            <Route path="/:house/:title/:id" element={<Proposal />} />

            <Route path="*" element={<NotFound />} />
          </Routes>

          {!socalCardPath && <Footer />}
        </div>
      </Suspense>
    </DAppProvider>
  );
}

export default App;
