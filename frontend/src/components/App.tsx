import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Library from "./Library";
import EldenRing from "./EldenRing";
import Downloads from "./Downloads";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/EldenRing" element={<EldenRing />} />
        <Route path="/Downloads" element={<Downloads />} />

      </Routes>
    </Router>
  );
}

export default App;
