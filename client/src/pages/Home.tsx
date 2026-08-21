import { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    FaUserShield,
    FaShoppingCart,
    FaCreditCard,
    FaBoxOpen,
    FaCheckCircle,
    FaSearch,
    FaTimes,
    FaPlus,
    FaMinus,
    FaBuilding,
    FaChevronDown,
} from 'react-icons/fa';
import Logo from '../assets/Logo.png';
import api from '../utils/api';

const Home = () => {
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const { cartItems, addToCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const observer = useRef<IntersectionObserver | null>(null);
    const [shopImage, setShopImage] = useState<string>('');

    // Medicine State
    const [medicines, setMedicines] = useState<any[]>([]);
    const [fastMoving, setFastMoving] = useState<any[]>([]);
    const [loadingMedicines, setLoadingMedicines] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('All');
    const [activeType, setActiveType] = useState<string>('ALL');
    const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
    const [allCompanies, setAllCompanies] = useState<string[]>(['All Companies']);
    const [isCompanyOpen, setIsCompanyOpen] = useState<boolean>(false);
    const companyRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);

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

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                setLoadingMedicines(true);
                const [medRes, fastMovingRes] = await Promise.all([
                    api.get('/medicines'),
                    api.get('/medicines/fast-moving')
                ]);
                setMedicines(medRes.data || []);
                setFastMoving(fastMovingRes.data || []);
            } catch (error) {
                console.error("Failed to load medicines", error);
            } finally {
                setLoadingMedicines(false);
            }
        };
        fetchMedicines();
    }, []);

    useEffect(() => {
        if (medicines.length > 0) {
            const uniqueCompaniesMap = new Map<string, string>();
            medicines.forEach((m: any) => {
                if (m.company && typeof m.company === 'string') {
                    const trimmed = m.company.trim();
                    if (trimmed && !uniqueCompaniesMap.has(trimmed.toLowerCase())) {
                        uniqueCompaniesMap.set(trimmed.toLowerCase(), trimmed);
                    }
                }
            });
            const sortedCompanies = Array.from(uniqueCompaniesMap.values()).sort((a, b) => a.localeCompare(b));
            setAllCompanies(['All Companies', ...sortedCompanies]);
        }
    }, [medicines]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
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

    // Filter Categories and Types
    const categoryTabs = ['All', 'PCD', 'Generic', 'Ethical', 'Other'];
    const typeCategories = ['ALL', 'Tablet', 'Syrup', 'Capsule', 'Drops', 'Pediatric Syrup', 'Pediatric Drops & Suspentions', 'Injection', 'Soap', 'Ointment/Cream', 'Protein Powder', 'Sachet', 'Dental', 'ENT'];

    const filteredMedicines = medicines.filter((med: any) => {
        const matchesCategory = activeTab === 'All' || med.category === activeTab;
        const matchesType = activeType === 'ALL' || med.type === activeType;
        const matchesCompany = selectedCompany === 'All Companies' ||
            (med.company && med.company.trim().toLowerCase() === selectedCompany.trim().toLowerCase());
        const matchesSearch = !searchQuery ||
            med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesCompany && matchesSearch;
    });

    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
    const currentMedicines = filteredMedicines.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getVisiblePageNumbers = () => {
        const maxPagesToShow = 5;
        if (totalPages <= maxPagesToShow) {
            return Array.from({ length: totalPages }, (_, i) => ({
                page: i + 1,
                label: `${i + 1}`,
            }));
        }
        let startPage = Math.max(1, currentPage - 2);
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            const isLastInWindow = i === endPage && endPage < totalPages;
            pages.push({
                page: i,
                label: isLastInWindow ? `${i}+` : `${i}`,
            });
        }
        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const el = document.getElementById('medicines');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Dynamic Title Logic
    const getDynamicTitle = () => {
        if (searchQuery) return { title: `Search Results: "${searchQuery}"`, subtitle: `Found ${filteredMedicines.length} matching products` };
        if (activeType !== 'ALL') {
            const typeMap: Record<string, string> = {
                'Tablet': 'Tablets', 'Syrup': 'Syrups', 'Capsule': 'Capsules', 'Injection': 'Injections',
                'Soap': 'Soaps', 'Ointment/Cream': 'Ointments & Creams', 'Drops': 'Drops',
                'Pediatric Syrup': 'Pediatric Syrups', 'Pediatric Drops & Suspentions': 'Pediatric Drops',
                'Protein Powder': 'Protein Powders', 'Sachet': 'Sachets', 'Dental': 'Dental Care', 'ENT': 'ENT Medicines'
            };
            return { title: typeMap[activeType] || activeType, subtitle: `Browse our collection of ${activeType.toLowerCase()}` };
        }
        if (activeTab !== 'All') return { title: `${activeTab} Medicines`, subtitle: `Browse certified ${activeTab} pharmaceutical supplies` };
        if (selectedCompany !== 'All Companies') return { title: selectedCompany, subtitle: `Products manufactured by ${selectedCompany}` };
        return { title: 'Available Medicines', subtitle: 'Browse through our comprehensive inventory of genuine pharmaceutical products.' };
    };

    const { title: dynamicTitle, subtitle: dynamicSubtitle } = getDynamicTitle();

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
                }`}>
                <div className="container mx-auto px-6 lg:px-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="Logo" className="h-12 md:h-14 w-auto transform hover:scale-110 transition-transform duration-300" />
                        <span className={`text-lg md:text-xl font-extrabold font-cinzel tracking-wider ${scrolled ? 'text-teal-900' : 'text-teal-950'} hidden sm:block`}>
                            Shree Veerabhadreshwara Pharma
                        </span>
                        <span className={`text-lg md:text-xl font-extrabold font-cinzel tracking-wider ${scrolled ? 'text-teal-900' : 'text-teal-950'} sm:hidden`}>
                            SV PHARMA
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-10">
                        <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-teal-900/70">
                            <a href="#medicines" className="hover:text-teal-600 transition-colors">Medicines</a>
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
                    <a href="#medicines" className="font-bold text-teal-900 py-2 border-b border-gray-50">Medicines</a>
                    <a href="#contact" className="font-bold text-teal-900 py-2 border-b border-gray-50">Contact</a>
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
            <header id="home" className="relative pt-24 pb-10 md:pt-32 md:pb-14 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 -z-10 rounded-l-[100px] hidden md:block" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="slide-up">
                        <div className="inline-flex items-center gap-2 bg-teal-100/50 text-teal-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            Trusted Pharma Partner
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-teal-950 leading-[1.1] mb-6 tracking-tight">
                            Your Trusted Pharmacy, <br />
                            <span className="text-teal-600 block mt-2">Delivered with Care</span>
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
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
            <section className="py-12 md:py-16 bg-slate-50/50">
                <div className="container mx-auto px-6 lg:px-16">
                    <div className="text-center mb-10 fade-in">
                        <h2 className="text-3xl md:text-4xl font-black text-teal-950 mb-3 tracking-tight">Empowering Your Pharmacy</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">Strategic medical solutions tailored for seamless healthcare distribution.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { icon: <FaShoppingCart />, title: "Efficient Ordering", desc: "Easily stock up on essential pharmaceutical supplies and manage your inventory at your convenience." },
                            { icon: <FaCreditCard />, title: "Secure Payments", desc: "Multiple payment options to help you manage your business transactions effectively." },
                            { icon: <FaBoxOpen />, title: "Fast Moving Meds", desc: "Priority access to the most in-demand medicines in the market." },
                            { icon: <FaUserShield />, title: "Admin Verified", desc: "Every transaction and document is manually verified for absolute transparency." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-teal-50 shadow-xl shadow-slate-100/50 hover-lift fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-4 sm:mb-6 transform group-hover:rotate-12 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-teal-900 mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Medicines Catalog Section */}
            <section id="medicines" className="py-12 md:py-16 bg-white">
                <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
                    {/* Dynamic Title */}
                    <div className="text-center mb-10 fade-in">
                        <div className="inline-flex items-center gap-2 bg-teal-100/60 text-teal-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            💊 Product Catalog
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-teal-950 mb-3 tracking-tight">
                            {dynamicTitle}
                        </h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm sm:text-base">
                            {dynamicSubtitle}
                        </p>
                    </div>

                    {/* Fast Moving Medicines Row (Right below Available Medicines title) */}
                    {fastMoving.length > 0 && !searchQuery && activeType === 'ALL' && activeTab === 'All' && selectedCompany === 'All Companies' && (
                        <div className="mb-10 p-6 bg-gradient-to-r from-teal-50/60 via-slate-50/40 to-teal-50/60 rounded-3xl border border-teal-100/60">
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 mb-1">
                                        🔥 Fast Moving
                                    </div>
                                    <h3 className="text-xl font-black text-teal-950 tracking-tight">
                                        Popular & Fast Moving
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
                                {fastMoving.map((med: any) => (
                                    <div
                                        key={`fm-${med._id}`}
                                        onClick={() => setSelectedMedicine(med)}
                                        className="w-52 sm:w-60 flex-shrink-0 group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 flex flex-col relative overflow-hidden p-4 cursor-pointer hover:-translate-y-1"
                                    >
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border border-amber-100">
                                                🔥 Fast Moving
                                            </span>
                                        </div>
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="bg-teal-50 text-teal-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border border-teal-100">
                                                {med.company || 'PCD'}
                                            </span>
                                        </div>

                                        <div className="h-32 flex items-center justify-center mb-3 bg-slate-50 rounded-xl p-3 group-hover:bg-teal-50/20 transition-colors border border-transparent group-hover:border-teal-50 relative overflow-hidden mt-5">
                                            {med.imageUrl ? (
                                                <img
                                                    src={med.imageUrl}
                                                    alt={med.name}
                                                    className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="text-slate-300 text-3xl">💊</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <h4 className="font-black text-slate-900 text-sm leading-tight mb-1 truncate group-hover:text-teal-600 transition-colors">
                                                {med.name}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mb-3 line-clamp-2 leading-relaxed font-medium">
                                                {med.description || 'Quality pharmaceutical product'}
                                            </p>

                                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                                                    <span className="text-sm font-black text-teal-600">₹{med.price ? med.price.toFixed(2) : '0.00'}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!user) {
                                                            navigate('/login');
                                                        } else if (user.role === 'customer') {
                                                            addToCart({ ...med, quantity: 1, price: med.price });
                                                        } else {
                                                            setSelectedMedicine(med);
                                                        }
                                                    }}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md shadow-teal-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                                                >
                                                    {user && user.role === 'customer' && cartItems.some((i: any) => i._id === med._id)
                                                        ? 'In Cart'
                                                        : 'Order'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Tabs & Search Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        {/* Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                            {categoryTabs.map((tab) => {
                                const count = tab === 'All' ? medicines.length : medicines.filter((m: any) => m.category === tab).length;
                                if (tab !== 'All' && count === 0) return null;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                            activeTab === tab
                                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-200'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                placeholder="Search medicine or description..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs font-bold text-slate-800 placeholder-slate-400"
                            />
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        </div>
                    </div>

                    {/* Type Pills & Company Dropdown Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-3 border-b border-slate-100 mb-10">
                        {/* Type Pills */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
                            {typeCategories.map((type) => {
                                const count = type === 'ALL' ? medicines.length : medicines.filter((m: any) => m.type === type).length;
                                if (type !== 'ALL' && count === 0) return null;

                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setActiveType(type);
                                            setCurrentPage(1);
                                        }}
                                        className={`whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg ${
                                            activeType === type
                                                ? 'text-teal-700 bg-teal-100/80 border border-teal-200 font-black'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Company Filter Dropdown */}
                        <div className="relative w-full sm:w-auto flex-shrink-0" ref={companyRef}>
                            <button
                                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                                className="w-full sm:min-w-[200px] flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-teal-400 transition-all text-left"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FaBuilding className="text-teal-600 flex-shrink-0 text-xs" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-700 truncate">
                                        {selectedCompany}
                                    </span>
                                </div>
                                <FaChevronDown className={`text-slate-400 transition-transform duration-300 text-xs ${isCompanyOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCompanyOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full sm:w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in duration-200">
                                    <div className="max-h-[260px] overflow-y-auto custom-scrollbar py-2">
                                        {allCompanies.map((company) => (
                                            <button
                                                key={company}
                                                onClick={() => {
                                                    setSelectedCompany(company);
                                                    setCurrentPage(1);
                                                    setIsCompanyOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-l-4 ${
                                                    selectedCompany === company
                                                        ? 'bg-teal-50 border-teal-600 text-teal-700'
                                                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {company}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medicine Cards Grid */}
                    {loadingMedicines ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 animate-pulse shadow-sm">
                                    <div className="h-40 bg-slate-100 rounded-2xl mb-4" />
                                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                                    <div className="h-8 bg-slate-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : filteredMedicines.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Medicines Found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your search query or filter settings.</p>
                            {(activeTab !== 'All' || activeType !== 'ALL' || selectedCompany !== 'All Companies' || searchQuery) && (
                                <button
                                    onClick={() => {
                                        setActiveTab('All');
                                        setActiveType('ALL');
                                        setSelectedCompany('All Companies');
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4 px-6 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-teal-700 transition-all"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {currentMedicines.map((med: any) => (
                                <div
                                    key={med._id}
                                    onClick={() => setSelectedMedicine(med)}
                                    className="group bg-white rounded-3xl border border-slate-100 hover:shadow-2xl hover:shadow-teal-100/60 transition-all duration-300 flex flex-col h-full relative overflow-hidden p-5 cursor-pointer hover:-translate-y-1"
                                >
                                    {/* Badges */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="bg-slate-50 text-[9px] font-black text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border border-slate-100">
                                            {med.category || 'General'}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black text-teal-600 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border border-gray-100">
                                            {med.company || 'PCD'}
                                        </span>
                                    </div>

                                    {/* Image Container */}
                                    <div className="h-44 flex items-center justify-center mb-4 bg-slate-50 rounded-2xl p-4 group-hover:bg-teal-50/20 transition-colors border border-transparent group-hover:border-teal-50 relative overflow-hidden mt-6">
                                        {med.imageUrl ? (
                                            <img
                                                src={med.imageUrl}
                                                alt={med.name}
                                                className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="text-slate-300 text-5xl">💊</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-black text-slate-900 text-base leading-tight mb-1 truncate group-hover:text-teal-600 transition-colors">
                                            {med.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed font-medium">
                                            {med.description || 'Quality pharmaceutical product'}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                                                <span className="text-lg font-black text-teal-600">₹{med.price ? med.price.toFixed(2) : '0.00'}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!user) {
                                                        navigate('/login');
                                                    } else if (user.role === 'customer') {
                                                        addToCart({ ...med, quantity: 1, price: med.price });
                                                    } else {
                                                        setSelectedMedicine(med);
                                                    }
                                                }}
                                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                                            >
                                                {user && user.role === 'customer' && cartItems.some((i: any) => i._id === med._id)
                                                    ? 'In Cart'
                                                    : 'Order'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages >= 1 && (
                        <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between w-full max-w-[1600px] mx-auto px-2 sm:px-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                                    currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-black hover:text-teal-600 cursor-pointer'
                                }`}
                            >
                                ← PREVIOUS
                            </button>

                            <div className="flex items-center gap-2 sm:gap-4">
                                {getVisiblePageNumbers().map((item) => (
                                    <button
                                        key={item.page}
                                        onClick={() => handlePageChange(item.page)}
                                        className={`transition-all duration-200 text-sm font-bold flex items-center justify-center ${
                                            currentPage === item.page
                                                ? 'w-8 h-8 rounded-full bg-teal-600 text-white shadow-md shadow-teal-200 font-black'
                                                : 'px-2 py-1 rounded-full text-slate-700 hover:bg-slate-100 hover:text-teal-600'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                                    currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-black hover:text-teal-600 cursor-pointer'
                                }`}
                            >
                                NEXT →
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Medicine Detail Modal */}
            {selectedMedicine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 border border-white/20 custom-scrollbar">
                        <button
                            onClick={() => setSelectedMedicine(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100"
                        >
                            <FaTimes />
                        </button>

                        <div className="p-1 bg-gradient-to-br from-teal-50 to-white">
                            <div className="h-64 bg-white rounded-[36px] flex items-center justify-center p-8 relative overflow-hidden border border-gray-100/50 shadow-inner">
                                <div className="absolute top-4 left-6">
                                    <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-teal-100">
                                        {selectedMedicine.category || 'General'}
                                    </span>
                                </div>
                                {selectedMedicine.imageUrl ? (
                                    <img src={selectedMedicine.imageUrl} alt={selectedMedicine.name} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                                ) : (
                                    <div className="text-6xl">💊</div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedMedicine.name}</h2>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-teal-600">₹{selectedMedicine.price ? selectedMedicine.price.toFixed(2) : '0.00'}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</span>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{selectedMedicine.company}</p>
                                <p className="text-xs font-medium text-gray-500">{selectedMedicine.packing} • {selectedMedicine.type}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-3 bg-teal-500 rounded-full"></div>
                                    Description
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    {selectedMedicine.description || 'No detailed description available.'}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                {!user ? (
                                    <button
                                        onClick={() => {
                                            setSelectedMedicine(null);
                                            navigate('/login');
                                        }}
                                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-teal-200 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Login to Order
                                    </button>
                                ) : user.role === 'customer' ? (
                                    cartItems.some((i: any) => i._id === selectedMedicine._id) ? (
                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Quantity in Cart</span>
                                            <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100">
                                                <button onClick={() => updateQuantity(selectedMedicine._id, -1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors"><FaMinus /></button>
                                                <span className="w-8 text-teal-600 text-lg font-black text-center">
                                                    {cartItems.find((i: any) => i._id === selectedMedicine._id)?.quantity || 1}
                                                </span>
                                                <button onClick={() => updateQuantity(selectedMedicine._id, 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors"><FaPlus /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                addToCart({ ...selectedMedicine, quantity: 1, price: selectedMedicine.price });
                                            }}
                                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-teal-200 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <FaPlus className="text-sm" /> Add to Cart
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => setSelectedMedicine(null)}
                                        className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold uppercase tracking-widest transition-all"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
