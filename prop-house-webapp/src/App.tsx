import { Routes, Route } from 'react-router-dom';
import '../src/css/globals.css';
import Home from './components/pages/Home';
import NotFound from './components/pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
