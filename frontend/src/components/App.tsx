import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Library from "./Library";
import EldenRing from "./EldenRing";
import Downloads from "./Downloads";
import Profile from "./Profile";
import ProfileGames from "./ProfileGames";
import ProfileWishlist from "./ProfileWishlist";
import ProfileReviews from "./ProfileReviews";
import ProfileFriends from "./ProfileFriends";
import Cart from "./Cart";
import Configuration from "./Configuration";
import EditProfile from "./EditProfile";

function App() {
  return (
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
        <Route path="/games" element={<ProfileGames />} />
        <Route path="/wishlist" element={<ProfileWishlist />} />
        <Route path="/reviews" element={<ProfileReviews />} />
        <Route path="/friends" element={<ProfileFriends />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/editProfile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;