import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FaSignOutAlt, FaChartPie, FaPlus, FaUserPlus, FaBox, FaCreditCard } from 'react-icons/fa';
import Footer from '../components/Footer';
import Logo from '../assets/Logo.png';


const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

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
        navigate('/');
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

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <FaChartPie />, type: null },
        { path: '/admin/inventory', label: 'Add New Meds', icon: <FaPlus />, type: null },
        { path: '/admin/requests', label: 'Add Customer', icon: <FaUserPlus />, type: 'requests' },
        { path: '/admin/orders', label: 'Manage Orders', icon: <FaBox />, type: 'orders' },
        { path: '/admin/payments', label: 'Payment Updates', icon: <FaCreditCard />, type: 'payments' },
        { path: '/admin/profile', label: 'Profile', icon: <FaUserPlus />, type: null },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-teal-50 to-teal-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-teal-100 border-r border-teal-200 flex flex-col shadow-lg">
                <div className="p-6">
                    {/* Logo/Header Area */}
                    <div className="flex flex-col items-center gap-2 text-teal-800 font-extrabold text-xl">
                        <img src={Logo} alt="Logo" className="h-16 w-auto mb-2 drop-shadow-md transform hover:scale-105 transition-transform" />
                        <span className="text-center text-xs tracking-widest uppercase opacity-80">{settings?.appName || 'SV Pharma'}</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => handleNavClick(item.type as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 relative ${location.pathname === item.path ? 'bg-teal-200 text-teal-900 border-l-4 border-teal-600' : 'text-teal-700 hover:bg-teal-200/50 hover:text-teal-900'}`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.type && counts[item.type as keyof typeof counts] > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {counts[item.type as keyof typeof counts]}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-teal-200">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-bold">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-28 flex flex-col justify-center px-8 border-b border-teal-200 bg-teal-50/50 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-900 font-serif drop-shadow-sm">
                            Shree Veerabhadreshwara Pharma
                        </h1>
                        <div className="h-1 w-32 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full mt-1"></div>
                        <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2 opacity-80">Admin Management Dashboard</p>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>

                    {/* Global Footer */}
                    <div className="mt-auto pt-10">
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
