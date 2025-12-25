import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Book from './pages/Book';
import Shop from './pages/Shop';
import Account from './pages/Account';
import Login from './pages/Login';
import logo from './assets/logo.svg';
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
      <img src={logo} className="site-logo-bottom" alt="logo" />
    </Router>
  );
}

export default App;
