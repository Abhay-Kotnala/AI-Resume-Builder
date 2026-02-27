import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Article } from './pages/Article';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';
import OAuth2Callback from './pages/OAuth2Callback';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { usePageTracking } from './hooks/usePageTracking';

/** Fires a GA4 page_view on every React Router navigation */
const PageTracker = () => { usePageTracking(); return null; };

function App() {
  return (
    <AuthProvider>
      <Router>
        <PageTracker />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="article/:id" element={<Article />} />
          </Route>
          {/* Full screen routes without the main Layout (Navbar/Footer) */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />
          {/* Protected routes — redirects to home if not authenticated */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
