import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Book from './pages/Book';
import Shop from './pages/Shop';
import Account from './pages/Account';
import Login from './pages/Login';
import logoFull from './assets/logo-full.svg';
import './App.css';

function App() {
  return (
    <Router>
      <Sidebar />
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <a href="/" aria-label="SkatesGamehosting home">
        <img src={logoFull} className="site-logo-bottom" alt="Skates Gamehosting logo" />
      </a>
    </Router>
  );
}

export default App;
