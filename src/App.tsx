import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import logoFull from './assets/logo-full.svg';
import './App.css';
import './components/ErrorBoundary.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Book = lazy(() => import('./pages/Book'));
const Shop = lazy(() => import('./pages/Shop'));
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));

// Loading component
const PageLoader = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Layout wrapper to conditionally show sidebar/topbar
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Sidebar />}
      {!isLoginPage && <Topbar />}
      {children}
      {!isLoginPage && (
        <a href="/" aria-label="SkatesGamehosting home">
          <img src={logoFull} className="site-logo-bottom" alt="Skates Gamehosting logo" />
        </a>
      )}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <Router>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/book"
                      element={
                        <ProtectedRoute>
                          <Book />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shop"
                      element={
                        <ProtectedRoute>
                          <Shop />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
            <Toaster position="top-right" />
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
