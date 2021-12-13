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

function App() {
  const dispatch = useAppDispatch();

  // Fetch initial auctions
  const backend = useAppSelector((state) => state.backend.backend);
  backend
    .getAuctions()
    .then((auctions: StoredAuction[]) => dispatch(addAuctions(auctions)));

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
      <Footer />
    </Container>
  );
}

export default App;
