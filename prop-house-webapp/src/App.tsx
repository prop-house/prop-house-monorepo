import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import NavBar from './components/NavBar';
import Home from './components/pages/Home';
import Browse from './components/pages/Browse';
import Learn from './components/pages/Learn';
import Create from './components/pages/Create';
import NotFound from './components/pages/NotFound';
import { Container } from 'react-bootstrap';
import './App.css';

function App() {
  return (
    <Container>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/create" element={<Create />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Container>
  );
}

export default App;
