import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Article } from './pages/Article';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';
import OAuth2Callback from './pages/OAuth2Callback';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { Profile } from './pages/Profile';
import { AboutUs } from './pages/AboutUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { HelpFAQ } from './pages/HelpFAQ';
import { Contact } from './pages/Contact';
import { ResumeGuides } from './pages/ResumeGuides';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { usePageTracking } from './hooks/usePageTracking';
import { PublicProfile } from './pages/PublicProfile';

/** Fires a GA4 page_view on every React Router navigation and catches ref codes */
const PageTracker = () => {
  usePageTracking();

  // Check for referral code in URL and save to a 7-day cookie
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      document.cookie = `elevateAI_ref_code=${refCode}; expires=${date.toUTCString()}; path=/`;
    }
  }, []);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="article/:id" element={<Article />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="help" element={<HelpFAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="resume-tips" element={<ResumeGuides />} />
            </Route>
            {/* Full screen routes without the main Layout (Navbar/Footer) */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/p/:referralCode" element={<PublicProfile />} />
            {/* Protected routes — redirects to home if not authenticated */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
