import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    FaUserShield,
    FaShoppingCart,
    FaCreditCard,
    FaBoxOpen,
    FaCheckCircle,
    FaPills,
} from 'react-icons/fa';
import Logo from '../assets/Logo.png';
import api from '../utils/api';
import Footer from '../components/Footer';

const Home = () => {
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const observer = useRef<IntersectionObserver | null>(null);
    const [shopImage, setShopImage] = useState<string>('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data && data.shopImage) {
                    setShopImage(data.shopImage);
                }
            } catch (error) {
                console.error("Failed to load shop image", error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Animation Observer
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.current?.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.current?.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
                }`}>
                <div className="container mx-auto px-6 lg:px-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="Logo" className="h-12 md:h-14 w-auto transform hover:scale-110 transition-transform duration-300" />
                        <span className={`text-xl font-black tracking-tighter ${scrolled ? 'text-teal-900' : 'text-teal-950'} hidden sm:block`}>
                            Shree Veerabhadreshwara Pharma
                        </span>
                        <span className={`text-xl font-black tracking-tighter ${scrolled ? 'text-teal-900' : 'text-teal-950'} sm:hidden`}>
                            SV PHARMA
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-10">
                        <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-teal-900/70">
                            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How it works</a>
                            <a href="#contact" className="hover:text-teal-600 transition-colors">Contact</a>
                        </div>

                        <div className="flex items-center gap-4">
                            {user && user.role === 'developer' ? (
                                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-red-200">
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="text-teal-900 font-bold text-sm px-4 py-2 hover:text-teal-600 transition-colors">Login</Link>
                                    <Link to="/register" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-teal-100 transition-all hover:-translate-y-0.5">
                                        Join Us
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <button className="lg:hidden text-teal-900" onClick={() => document.getElementById('mobile-nav')?.classList.toggle('hidden')}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                </div>

                {/* Mobile Nav */}
                <div id="mobile-nav" className="hidden lg:hidden bg-white border-t border-gray-100 shadow-2xl p-6 absolute top-full left-0 right-0 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    <a href="#how-it-works" className="font-bold text-teal-900 py-2 border-b border-gray-50">How it works</a>
                    {user && user.role === 'developer' ? (
                        <button onClick={handleLogout} className="bg-red-500 text-white py-4 rounded-2xl font-bold">Logout</button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Link to="/login" className="text-center font-bold text-teal-900 py-4 rounded-2xl bg-teal-50">Login</Link>
                            <Link to="/register" className="text-center font-bold text-white py-4 rounded-2xl bg-teal-600 shadow-lg shadow-teal-100">Join Us</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 -z-10 rounded-l-[100px] hidden md:block" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="slide-up">
                        <div className="inline-flex items-center gap-2 bg-teal-100/50 text-teal-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            Trusted Pharma Partner
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-teal-950 leading-[1.1] mb-8 tracking-tight">
                            Your Trusted Pharmacy, <br />
                            <span className="text-teal-600 block mt-2">Delivered with Care</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-xl">
                            Order medicines with ease and manage your pharmacy inventory.
                            Experience a streamlined medical supply chain tailored for your business needs.
                        </p>
                    </div>

                    <div className="relative slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="absolute inset-0 bg-teal-500/10 rounded-[40px] rotate-6 transform scale-105" />
                        <img
                            src={shopImage || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000"}
                            alt="Medical Support"
                            className="relative rounded-[40px] shadow-2xl border-8 border-white object-cover aspect-[4/3] w-full"
                        />
                        {/* Floating elements */}
                        <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-teal-50 animate-bounce duration-[3000ms] hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-100 rounded-2xl text-teal-600">
                                    <FaCheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verification Status</p>
                                    <p className="font-bold text-teal-900">100% Secure & Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Key Features Section */}
            <section className="py-24 bg-slate-50/50">
                <div className="container mx-auto px-6 lg:px-16">
                    <div className="text-center mb-20 fade-in">
                        <h2 className="text-3xl md:text-5xl font-black text-teal-950 mb-6 tracking-tight">Empowering Your Pharmacy</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">Strategic medical solutions tailored for seamless healthcare distribution.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <FaShoppingCart />, title: "Efficient Ordering", desc: "Easily stock up on essential pharmaceutical supplies and manage your inventory at your convenience." },
                            { icon: <FaCreditCard />, title: "Secure Payments", desc: "Multiple payment options to help you manage your business transactions effectively." },
                            { icon: <FaBoxOpen />, title: "Fast Moving Meds", desc: "Priority access to the most in-demand medicines in the market." },
                            { icon: <FaUserShield />, title: "Admin Verified", desc: "Every transaction and document is manually verified for absolute transparency." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-10 rounded-[32px] border border-teal-50 shadow-xl shadow-slate-100/50 hover-lift fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-8 transform group-hover:rotate-12 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-teal-900 mb-4">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 overflow-hidden">
                <div className="container mx-auto px-6 lg:px-16">
                    <div className="text-center mb-20 fade-in">
                        <h2 className="text-3xl md:text-5xl font-black text-teal-950 mb-6 tracking-tight tracking-tight">Seamless Workflow</h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">Get your supplies in four simple steps designed for business efficiency.</p>
                    </div>

                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-teal-100 -translate-y-1/2 hidden lg:block" />

                        <div className="grid lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
                            {[
                                { step: "01", title: "Select Medicines", desc: "Browse our expansive catalog and add medicines to your cart." },
                                { step: "02", title: "Place Order", desc: "Submit your order instantly without any initial payment barrier." },
                                { step: "03", title: "Complete Payment", desc: "Clear your balance through our secure and transparent payment verification system." },
                                { step: "04", title: "Verification", desc: "Admin verifies payments and dispatches for rapid delivery." }
                            ].map((item, i) => (
                                <div key={i} className="group flex flex-col items-center text-center fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                                    <div className="w-20 h-20 bg-white border-4 border-teal-600 rounded-full flex items-center justify-center text-2xl font-black text-teal-600 mb-8 shadow-xl shadow-teal-100 transition-all group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-teal-300">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-black text-teal-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* Why Choose Us Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative fade-in">
                        <div className="absolute -inset-4 bg-teal-600/5 rounded-[50px] rotate-2" />
                        <img
                            src="https://images.unsplash.com/photo-1584017945516-507f5c425049?auto=format&fit=crop&q=80&w=1000"
                            alt="Pharma Excellence"
                            className="relative rounded-[40px] shadow-3xl shadow-teal-100 object-cover w-full h-[600px]"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl pulse-animation">
                            <FaPills className="text-teal-600 flex-shrink-0" size={32} />
                        </div>
                    </div>

                    <div className="fade-in">
                        <h2 className="text-3xl md:text-5xl font-black text-teal-950 mb-10 tracking-tight">Standardizing <br /><span className="text-teal-600">Medical Distribution</span></h2>
                        <div className="space-y-8">
                            {[
                                { title: "Trusted Suppliers", desc: "Collaborations with world-renowned pharmaceutical manufacturers." },
                                { title: "Flexible Solutions", desc: "Customized procurement strategies to support small to mid-scale pharmacies." },
                                { title: "Order Tracking", desc: "Transparent, real-time updates from order placement to doorstep." },
                                { title: "Rapid Verification", desc: "Optimized manual verification process for immediate stock release." }
                            ].map((benefit, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 font-bold">
                                        <FaCheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-teal-900 mb-2">{benefit.title}</h4>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div id="contact">
                <Footer />
            </div>
        </div>
    );
};

export default Home;
