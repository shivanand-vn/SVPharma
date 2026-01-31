import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaPills, FaTruck, FaUserShield, FaArrowRight } from 'react-icons/fa';
import Logo from '../assets/Logo.png';
import api from '../utils/api';
import Footer from '../components/Footer';

const Home = () => {
    const [settings, setSettings] = useState({
        appName: 'Shree Veerabhadreshwara Pharma',
        email: 'admin@svpharma.in',
        phone: '+91 98765 43210',
        address: '123 Pharma Street, Medical District',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        developerName: 'AntiGravity Team',
        developerLink: '#'
    });
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data) setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-teal-50 font-sans">
            {/* Navbar */}
            <nav className="p-6 lg:px-16 container mx-auto relative z-50 flex justify-between items-center h-24">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 z-20">
                    <img src={Logo} alt={settings.appName} className="h-24 w-auto drop-shadow-sm transform hover:scale-105 transition-transform" />
                </div>

                {/* Center: Title (Absolute) */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block w-max text-center">
                    <span className="text-3xl lg:text-4xl font-bold text-teal-900 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {settings.appName}
                    </span>
                </div>

                {/* Right: Desktop Nav */}
                <div className="hidden md:flex gap-4 z-20">
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-teal-700 font-bold hover:text-teal-900 px-4 py-2">Dashboard</Link>
                            )}
                            {user.role === 'customer' && (
                                <Link to="/customer" className="text-teal-700 font-bold hover:text-teal-900 px-4 py-2">Dashboard</Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-red-600 transition-all hover:shadow-red-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-teal-700 font-bold hover:text-teal-900 px-4 py-2">Login</Link>
                            <Link to="/register" className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-teal-700 transition-all hover:shadow-teal-200">
                                Join Us
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden z-20">
                    <button className="text-teal-800 p-2" onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <div id="mobile-menu" className="hidden absolute top-full left-0 right-0 bg-white shadow-xl p-4 flex flex-col gap-4 md:hidden border-t border-gray-100 z-50">
                    {/* Show Title in Mobile Menu since it's hidden on small navbars */}
                    <div className="text-center pb-4 border-b border-gray-100 mb-2">
                        <span className="text-xl font-bold text-teal-900" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {settings.appName}
                        </span>
                    </div>
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-center text-teal-700 font-bold py-3 hover:bg-teal-50 rounded-xl">Dashboard</Link>
                            )}
                            {user.role === 'customer' && (
                                <Link to="/customer" className="text-center text-teal-700 font-bold py-3 hover:bg-teal-50 rounded-xl">Dashboard</Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-center bg-red-500 text-white py-3 rounded-xl font-bold shadow-md"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-center text-teal-700 font-bold py-3 hover:bg-teal-50 rounded-xl">Login</Link>
                            <Link to="/register" className="text-center bg-teal-600 text-white py-3 rounded-xl font-bold shadow-md">Join Us</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 lg:px-16 py-12 flex flex-col items-center text-center">
                <div className="max-w-4xl mx-auto mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-teal-900 leading-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Quality Medicines, <br />
                        <span className="text-teal-600 italic">Timely Delivery.</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                        {settings.appName} is your trusted partner for pharmaceutical distribution. We connect pharmacies and hospitals with the best quality medicines.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-teal-700 transition-all hover:scale-105">
                            Get Started <FaArrowRight />
                        </Link>
                        <Link to="/login" className="flex items-center justify-center gap-2 bg-white text-teal-700 border-2 border-teal-100 px-8 py-3 rounded-full font-bold hover:bg-teal-50 transition-all">
                            Login
                        </Link>
                    </div>
                </div>
                <div className="w-full max-w-5xl relative">
                    <div className="absolute inset-0 bg-teal-200 rounded-full filter blur-3xl opacity-30 transform translate-y-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        alt="Pharmacy Distribution"
                        className="relative rounded-3xl shadow-2xl z-10 border-4 border-white w-full object-cover h-[400px] md:h-[500px]"
                    />
                </div>
            </header>

            {/* Features */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-6 lg:px-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-teal-900 mb-4">Why Partner With Us?</h2>
                        <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                                <FaTruck size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
                            <p className="text-gray-600">We ensure your stock is replenished rapidly with our efficient logistics network.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                                <FaPills size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Genuine Products</h3>
                            <p className="text-gray-600">100% authentic medicines sourced directly from approved manufacturers.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-teal-50 border border-teal-100 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                                <FaUserShield size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Trusted Support</h3>
                            <p className="text-gray-600">Dedicated support team to handle all your queries and account needs.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
