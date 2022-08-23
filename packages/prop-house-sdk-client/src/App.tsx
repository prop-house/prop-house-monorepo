import FetchHouse from './components/FetchHouse';
import { PropHouseProvider } from '@prop-house/hooks';
import CreateDataCards from './components/CreateDataCards';
import FetchRound from './components/FetchRound';

function App() {
  return (
    <PropHouseProvider>
      <div className="flex flex-row flex-wrap justify-center">
        <FetchHouse />
        <FetchRound />
        <CreateDataCards />
      </div>
    </PropHouseProvider>
  );
}

export default App;
