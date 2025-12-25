import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f0f0f0' }}>
      <Link to="/">Home</Link>
      <Link to="/book">Book</Link>
      <Link to="/shop">Shop</Link>
      <Link to="/account">My Account</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
};

export default Nav;