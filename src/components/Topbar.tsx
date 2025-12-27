import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../hooks/useApi';
import './Topbar.css';

const Topbar = () => {
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const { data: userData } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = userData || authUser;

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Home / Dashboard';
    if (path === '/book') return 'Home / Book Server';
    if (path === '/shop') return 'Home / Shop';
    if (path === '/account') return 'Home / Account';
    return 'Home';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sg-topbar">
      <div className="sg-top-left">
        <div className="sg-breadcrumb">{getBreadcrumb()}</div>
      </div>
      <div className="sg-top-right">
        <div className="sg-search">
          <input placeholder="Search servers, bookings..." aria-label="Search" />
        </div>
        <div className="sg-user-container" ref={menuRef}>
          <button
            className="sg-user"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            {user?.username || 'Loading...'}
            {user && <span className="user-hours">{user.hoursBalance}h</span>}
          </button>

          {showUserMenu && (
            <div className="user-menu">
              {user && (
                <>
                  <div className="user-menu-header">
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img
                          src={'https://cdn.discordapp.com/avatars/' + user.discordId + '/' + user.avatar + '.png'}
                          alt={user.username + ' avatar'}
                        />
                      ) : (
                        <div className="user-avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-balance">{user.hoursBalance} hours</div>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                </>
              )}
              <button
                className="user-menu-item"
                onClick={() => {
                  window.location.href = '/#/account';
                  setShowUserMenu(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </button>
              <button className="user-menu-item user-menu-logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
