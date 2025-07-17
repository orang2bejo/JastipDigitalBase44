import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CreateOrder from "./CreateOrder";

import DriverDashboard from "./DriverDashboard";

import Chat from "./Chat";

import Reviews from "./Reviews";

import TermsAndConditions from "./TermsAndConditions";

import DriverRegistration from "./DriverRegistration";

import DriverActivation from "./DriverActivation";

import ZoneManagement from "./ZoneManagement";

import SuggestZone from "./SuggestZone";

import CoverageChecker from "./CoverageChecker";

import DriverVerificationPending from "./DriverVerificationPending";

import SpecialistService from "./SpecialistService";

import Wallet from "./Wallet";

import MitraDashboard from "./MitraDashboard";

import SpecialistNegotiation from "./SpecialistNegotiation";

import MitraRegistration from "./MitraRegistration";

import OrderDetail from "./OrderDetail";

import UserProfile from "./UserProfile";

import AdminPanel from "./AdminPanel";

import HallOfFame from "./HallOfFame";

import LandingPage from "./LandingPage";

import Home from "./Home";

import ChatList from "./ChatList";

import UserGuide from "./UserGuide";

import PricingInfo from "./PricingInfo";

import PaymentReturn from "./PaymentReturn";

import PaymentSuccess from "./PaymentSuccess";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    CreateOrder: CreateOrder,
    
    DriverDashboard: DriverDashboard,
    
    Chat: Chat,
    
    Reviews: Reviews,
    
    TermsAndConditions: TermsAndConditions,
    
    DriverRegistration: DriverRegistration,
    
    DriverActivation: DriverActivation,
    
    ZoneManagement: ZoneManagement,
    
    SuggestZone: SuggestZone,
    
    CoverageChecker: CoverageChecker,
    
    DriverVerificationPending: DriverVerificationPending,
    
    SpecialistService: SpecialistService,
    
    Wallet: Wallet,
    
    MitraDashboard: MitraDashboard,
    
    SpecialistNegotiation: SpecialistNegotiation,
    
    MitraRegistration: MitraRegistration,
    
    OrderDetail: OrderDetail,
    
    UserProfile: UserProfile,
    
    AdminPanel: AdminPanel,
    
    HallOfFame: HallOfFame,
    
    LandingPage: LandingPage,
    
    Home: Home,
    
    ChatList: ChatList,
    
    UserGuide: UserGuide,
    
    PricingInfo: PricingInfo,
    
    PaymentReturn: PaymentReturn,
    
    PaymentSuccess: PaymentSuccess,
    
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
                
                <Route path="/CreateOrder" element={<CreateOrder />} />
                
                <Route path="/DriverDashboard" element={<DriverDashboard />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Reviews" element={<Reviews />} />
                
                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                
                <Route path="/DriverRegistration" element={<DriverRegistration />} />
                
                <Route path="/DriverActivation" element={<DriverActivation />} />
                
                <Route path="/ZoneManagement" element={<ZoneManagement />} />
                
                <Route path="/SuggestZone" element={<SuggestZone />} />
                
                <Route path="/CoverageChecker" element={<CoverageChecker />} />
                
                <Route path="/DriverVerificationPending" element={<DriverVerificationPending />} />
                
                <Route path="/SpecialistService" element={<SpecialistService />} />
                
                <Route path="/Wallet" element={<Wallet />} />
                
                <Route path="/MitraDashboard" element={<MitraDashboard />} />
                
                <Route path="/SpecialistNegotiation" element={<SpecialistNegotiation />} />
                
                <Route path="/MitraRegistration" element={<MitraRegistration />} />
                
                <Route path="/OrderDetail" element={<OrderDetail />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/HallOfFame" element={<HallOfFame />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/ChatList" element={<ChatList />} />
                
                <Route path="/UserGuide" element={<UserGuide />} />
                
                <Route path="/PricingInfo" element={<PricingInfo />} />
                
                <Route path="/PaymentReturn" element={<PaymentReturn />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
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