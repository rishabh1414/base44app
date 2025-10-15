import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import ContentCalendar from "./ContentCalendar";

import Contacts from "./Contacts";

import AdminDashboard from "./AdminDashboard";

import PowerUps from "./PowerUps";

import Integrations from "./Integrations";

import Billing from "./Billing";

import ClientManagement from "./ClientManagement";

import RevenueDashboard from "./RevenueDashboard";

import PlatformAnalytics from "./PlatformAnalytics";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ContentCalendar: ContentCalendar,
    
    Contacts: Contacts,
    
    AdminDashboard: AdminDashboard,
    
    PowerUps: PowerUps,
    
    Integrations: Integrations,
    
    Billing: Billing,
    
    ClientManagement: ClientManagement,
    
    RevenueDashboard: RevenueDashboard,
    
    PlatformAnalytics: PlatformAnalytics,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ContentCalendar" element={<ContentCalendar />} />
                
                <Route path="/Contacts" element={<Contacts />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/PowerUps" element={<PowerUps />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/ClientManagement" element={<ClientManagement />} />
                
                <Route path="/RevenueDashboard" element={<RevenueDashboard />} />
                
                <Route path="/PlatformAnalytics" element={<PlatformAnalytics />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}