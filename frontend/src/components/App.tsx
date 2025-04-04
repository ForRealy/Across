import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Library from "./Library";
import EldenRing from "./EldenRing";
import Downloads from "./Downloads";
import Profile from "./Profile";
import Cart from "./Cart";
import Configuration from "./Configuration";
import EditProfile from "./EditProfile";
import ChangeEmail from "./ChangeEmail";
import ChangeNumber from "./ChangeNumber";

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/library" element={<Library />} />
        <Route path="/EldenRing" element={<EldenRing />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/editProfile" element={<EditProfile />} />
        <Route path="/changeEmail" element={<ChangeEmail />} />
        <Route path="/changeNumber" element={<ChangeNumber />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;