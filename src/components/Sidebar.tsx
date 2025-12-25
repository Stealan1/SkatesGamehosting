import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sg-sidebar">
      <div className="sg-logo">SG<span className="sg-dot">.</span></div>
      <nav className="sg-nav">
        <NavLink to="/" end className={({isActive})=>isActive?"active":""}>Dashboard</NavLink>
        <NavLink to="/book" className={({isActive})=>isActive?"active":""}>Book</NavLink>
        <NavLink to="/shop" className={({isActive})=>isActive?"active":""}>Shop</NavLink>
        <NavLink to="/account" className={({isActive})=>isActive?"active":""}>Account</NavLink>
      </nav>
      <div className="sg-side-footer">© SkatesGameHosting</div>
    </aside>
  );
};

export default Sidebar;
