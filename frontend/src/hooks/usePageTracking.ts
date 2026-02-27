import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';

/**
 * Fires a GA4 `page_view` event every time the React Router location changes.
 * Place a component that uses this hook inside <Router> in App.tsx.
 */
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location]);
};
