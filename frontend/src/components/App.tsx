import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Header from "./Header";

function App() {
  return (
    <Router>
      {/* Colocamos el Header fuera de Routes para que siempre se muestre */}
      <Header username="Player123" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
