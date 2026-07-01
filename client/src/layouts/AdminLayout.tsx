import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
    FaSignOutAlt, FaChartPie, FaPlus, FaUserPlus, FaBox, FaCreditCard, 
    FaChartLine, FaChevronDown, FaChevronUp, 
    FaFileAlt, FaUsers, FaBars, FaTimes, FaUser
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import Logo from '../assets/Logo.png';


const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [settings, setSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    // Notification State
    const [counts, setCounts] = React.useState({ requests: 0, orders: 0, payments: 0 });
    const lastSeenRef = React.useRef({
        requests: localStorage.getItem('lastSeenRequests') || new Date(0).toISOString(),
        orders: localStorage.getItem('lastSeenOrders') || new Date(0).toISOString(),
        payments: localStorage.getItem('lastSeenPayments') || new Date(0).toISOString()
    });

    const fetchNotifications = React.useCallback(async () => {
        try {
            const { requests, orders, payments } = lastSeenRef.current;
            const { data } = await api.get(`/admin/notifications?requestsSince=${requests}&ordersSince=${orders}&paymentsSince=${payments}`);
            setCounts(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    }, []);

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNavClick = (type: 'requests' | 'orders' | 'payments' | null) => {
        if (type) {
            const now = new Date().toISOString();
            localStorage.setItem(`lastSeen${type.charAt(0).toUpperCase() + type.slice(1)}`, now);
            lastSeenRef.current[type] = now;
            setCounts(prev => ({ ...prev, [type]: 0 }));
        }
    };

    const [reportsOpen, setReportsOpen] = React.useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        if (location.pathname.startsWith('/admin/reports')) {
            setReportsOpen(true);
        }
    }, [location.pathname]);

    const isReportTabActive = (tab: string) => {
        const params = new URLSearchParams(location.search);
        return location.pathname === '/admin/reports' && params.get('tab') === tab;
    };

    const mainNavItems = [
        { path: '/admin', label: 'Dashboard', icon: <FaChartPie />, type: null },
        { path: '/admin/inventory', label: 'Add New Meds', icon: <FaPlus />, type: null },
        { path: '/admin/requests', label: 'Add Customer', icon: <FaUserPlus />, type: 'requests' },
        { path: '/admin/orders', label: 'Manage Orders', icon: <FaBox />, type: 'orders' },
        { path: '/admin/payments', label: 'Payment Updates', icon: <FaCreditCard />, type: 'payments' },
    ];

    const reportSubItems = [
        { tab: 'sales', label: 'Sales Reports', icon: <FaChartLine /> },
        { tab: 'customers', label: 'Customer List', icon: <FaUsers /> },
        { tab: 'payments', label: 'Payment Reports', icon: <FaCreditCard /> },
        { tab: 'orders', label: 'Order Reports', icon: <FaBox /> },
        { tab: 'revenue', label: 'Revenue Reports', icon: <FaChartLine /> },
    ];

    const managementNavItems = [
        { path: '/admin/profile', label: 'Admin Profile', icon: <FaUser /> },
    ];

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full bg-teal-100 text-teal-800 border-r border-teal-200">
            {/* Logo area */}
            <div className="p-6 border-b border-teal-200 flex items-center justify-between">
                <div className="flex flex-col items-center gap-2 text-teal-800 font-extrabold text-xl w-full">
                    <img src={Logo} alt="Logo" className="h-16 w-auto mb-2 drop-shadow-md transform hover:scale-105 transition-transform" />
                    <span className="text-center text-xs tracking-widest uppercase opacity-80">{settings?.appName || 'SV Pharma'}</span>
                </div>
                {/* Mobile close button */}
                <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="lg:hidden text-teal-700 hover:text-teal-900 p-2 hover:bg-teal-200 rounded-xl transition-all self-start mt-2"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Menu List */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {mainNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                handleNavClick(item.type as 'requests' | 'orders' | 'payments' | null);
                                setMobileSidebarOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                                isActive 
                                ? 'bg-teal-200 text-teal-900 border-l-4 border-teal-600 shadow-sm' 
                                : 'text-teal-700 hover:bg-teal-200/50 hover:text-teal-900'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.type && counts[item.type as keyof typeof counts] > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {counts[item.type as keyof typeof counts]}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Collapsible Reports */}
                <div className="space-y-1">
                    <button
                        onClick={() => setReportsOpen(!reportsOpen)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-teal-700 hover:bg-teal-200/50 hover:text-teal-900`}
                    >
                        <span className="text-lg"><FaFileAlt /></span>
                        <span className="flex-1 text-left">Business Reports</span>
                        <span className="text-xs transition-transform duration-200">
                            {reportsOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {reportsOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-4 pr-1 mt-1 space-y-1 border-l-2 border-teal-300 ml-5"
                            >
                                {reportSubItems.map((subItem) => {
                                    const isActive = isReportTabActive(subItem.tab);
                                    return (
                                        <Link
                                            key={subItem.tab}
                                            to={`/admin/reports?tab=${subItem.tab}`}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                                isActive 
                                                ? 'bg-teal-200/60 text-teal-900 border-l-2 border-teal-600 font-extrabold' 
                                                : 'text-teal-700/80 hover:text-teal-950 hover:bg-teal-200/30'
                                            }`}
                                        >
                                            <span className="text-base">{subItem.icon}</span>
                                            <span>{subItem.label}</span>
                                        </Link>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Link */}
                {managementNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                                isActive 
                                ? 'bg-teal-200 text-teal-900 border-l-4 border-teal-600 shadow-sm' 
                                : 'text-teal-700 hover:bg-teal-200/50 hover:text-teal-900'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label === 'Admin Profile' ? 'Profile' : item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-teal-200 bg-teal-50/50">
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-bold"
                >
                    <FaSignOutAlt className="text-base" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-teal-50 to-teal-100 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:flex-shrink-0 shadow-lg z-20">
                {renderSidebarContent()}
            </div>

            {/* Mobile Sidebar (Slide Drawer) */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 flex lg:hidden">
                        {/* Overlay backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black"
                        />
                        {/* Drawer body */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative flex flex-col w-64 max-w-xs h-full shadow-2xl"
                        >
                            {renderSidebarContent()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Workspace Frame */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Premium Admin Header Banner */}
                <header className="h-28 flex flex-col justify-center px-8 border-b border-teal-200 bg-teal-50/50 backdrop-blur-sm relative overflow-hidden flex-shrink-0 z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 font-serif drop-shadow-sm">
                                Shree Veerabhadreshwara Pharma
                            </h1>
                            <div className="h-1 w-32 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full mt-1"></div>
                            <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2 opacity-80">Admin Management Dashboard</p>
                        </div>
                        {/* Hamburger Button for mobile */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-3 text-teal-800 hover:bg-teal-100 rounded-2xl transition-all"
                            title="Toggle Menu"
                        >
                            <FaBars size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Workspace */}
                <main className="flex-1 overflow-auto p-8 relative">
                    <Outlet />
                    {/* Integrated Common Footer */}
                    <div className="pt-10">
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
