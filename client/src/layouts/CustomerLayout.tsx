import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    FaSignOutAlt, FaShoppingCart, FaWallet,
    FaUserCircle, FaMobileAlt, FaAt, FaTimes,
    FaTrash, FaPlus, FaMinus, FaReceipt
} from 'react-icons/fa';
import Footer from '../components/Footer';
import api from '../utils/api';
import StructuredAddressForm from '../components/StructuredAddressForm';
import { normalizeAddress, formatAddress } from '../types/address';
import Logo from '../assets/Logo.png';

const CustomerLayout = () => {
    const { logout, user, updateUser } = useContext(AuthContext);
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const [balance, setBalance] = useState(0);
    const [walletCredit, setWalletCredit] = useState(0);

    // Dropdown States
    const [profileOpen, setProfileOpen] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Profile Edit State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: normalizeAddress(user?.address),
        type: user?.type || 'Retailer'
    });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const profileRef = useRef<HTMLDivElement>(null);
    const walletRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);

    // Fetch due amount and transactions ONCE on mount
    useEffect(() => {
        const fetchLayoutData = async () => {
            try {
                const [walletRes] = await Promise.all([
                    api.get('/payments/wallet'),
                    api.get('/orders/myorders')
                ]);
                if (walletRes.data) {
                    setBalance(walletRes.data.pendingBalance);
                    setWalletCredit(walletRes.data.walletBalance || 0);
                }
            } catch (error) {
                console.error("Failed to fetch layout data", error);
            }
        };
        fetchLayoutData();
    }, []);

    // Update profile form data when user context changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: normalizeAddress(user.address),
                type: user.type || 'Retailer'
            });
            console.log('Profile form data updated');
        }
    }, [user]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
            if (walletRef.current && !walletRef.current.contains(event.target as Node)) setWalletOpen(false);
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) setCartOpen(false);
        };
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
                setWalletOpen(false);
                setCartOpen(false);
                setEditModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const formatDisplayName = (name?: string, type?: string) => {
        if (!name) return 'Customer';
        if (type === 'Doctor') return `Dr. ${name}`;
        if (type === 'Medical') return `${name} Medical`;
        return name;
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditSaving(true);
        setEditError('');

        try {
            // Clean payload - remove empty strings from address
            const cleanedAddress = {
                ...profileData.address,
                floor: profileData.address.floor?.trim() || undefined,
                building: profileData.address.building?.trim() || undefined,
                area: profileData.address.area?.trim() || undefined,
                taluk: profileData.address.taluk?.trim() || undefined,
                city: profileData.address.city?.trim() || undefined,
                district: profileData.address.district?.trim() || undefined,
                state: profileData.address.state?.trim() || undefined,
                pincode: profileData.address.pincode?.trim() || undefined,
                landmark: profileData.address.landmark?.trim() || undefined
            };

            // Remove undefined values
            Object.keys(cleanedAddress).forEach(key =>
                cleanedAddress[key as keyof typeof cleanedAddress] === undefined &&
                delete cleanedAddress[key as keyof typeof cleanedAddress]
            );

            // IMPORTANT: Only send address - identity fields (name, email, phone) are read-only
            // Customers must contact admin to update identity information
            const payload = {
                address: cleanedAddress
            };

            console.log('Sending profile update (address only):', payload);

            const { data } = await api.put('/customers/profile', payload);
            if (user) {
                updateUser({ ...user, ...data });
            } else {
                updateUser(data);
            }
            setEditModalOpen(false);
            setProfileOpen(false);

            console.log('Profile updated successfully!');
        } catch (error: any) {
            console.error('Profile update error:', error);
            setEditError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditSaving(false);
        }
    };

    // Display Due Balance (Priority: Customer.dueAmount from context)
    const displayDue = user?.dueAmount !== undefined ? user.dueAmount : balance;

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 text-[#1e293b]">
            {/* Smooth Logout Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-6 animate-out slide-out-to-bottom-20 duration-1000">
                        <div className="h-20 w-20 rounded-[32px] bg-red-50 flex items-center justify-center text-red-500 relative">
                            <FaSignOutAlt size={40} className="animate-pulse" />
                            <div className="absolute inset-0 rounded-[32px] border-4 border-red-500/20 animate-ping"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-800 font-serif">Signing Out...</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">See you soon!</p>
                        </div>
                    </div>
                </div>
            )}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mobile Title Row */}
                    <div className="md:hidden pt-3 pb-1 text-center border-b border-teal-50">
                        <h1 className="text-sm font-black text-[#0d9488] font-serif tracking-tight leading-none px-2">
                            Shree Veerabhadreshwara Pharma
                        </h1>
                    </div>

                    <div className="flex justify-between items-center h-16 md:h-20 gap-3">
                        {/* Desktop Header Content (Logo & Title) */}
                        <div className="hidden md:flex flex-1 items-center gap-6 relative">
                            <div className="flex items-center">
                                <Link to="/customer" className="flex items-center gap-3">
                                    <img src={Logo} alt="Logo" className="h-12 w-auto drop-shadow-sm transform hover:scale-105 transition-transform" />
                                </Link>
                            </div>
                            <div className="flex-1 text-center pr-20">
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0d9488] font-serif leading-none mb-0.5">
                                    Shree Veerabhadreshwara Pharma
                                </h1>
                                <p className="text-[10px] text-[#0d9488]/70 font-bold uppercase tracking-[0.2em] leading-none">Customer Shopping Portal</p>
                            </div>
                        </div>

                        {/* Mobile Row 2: (Logo, SearchBar, Actions) */}
                        <div className="flex flex-1 items-center gap-2 md:hidden">
                            <Link to="/customer" className="flex items-center">
                                <img src={Logo} alt="Logo" className="h-7 w-auto drop-shadow-sm" />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-[#0d9488]/70 uppercase tracking-widest truncate">Quality Medicines • Trusted Care</p>
                            </div>
                        </div>

                        {/* User Actions (Due Amount, Cart, Profile) */}
                        <div className="flex items-center gap-1.5 md:gap-4 relative">
                            {/* Due Amount Dropdown Trigger */}
                            <div className="relative" ref={walletRef}>
                                <button
                                    onClick={() => { setWalletOpen(!walletOpen); setProfileOpen(false); setCartOpen(false); }}
                                    className={`flex flex-col items-center px-1.5 sm:px-3 py-1 rounded-xl transition-all ${walletOpen ? 'bg-teal-50 shadow-sm' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <FaWallet className={`text-sm sm:text-lg ${walletCredit > 0 ? 'text-amber-500' : 'text-teal-600'}`} />
                                        {(displayDue > 0 || walletCredit > 0) && (
                                            <span className={`absolute -top-1.5 -right-1.5 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border border-white ${walletCredit > 0 ? 'bg-amber-500' : 'bg-orange-500'}`}>
                                                ₹{walletCredit > 0 ? walletCredit.toFixed(2) : displayDue.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {walletOpen && (
                                    <div className="fixed md:absolute top-24 md:top-auto inset-x-4 md:inset-x-auto md:right-0 mt-3 md:w-[400px] bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300 z-[120]">
                                        <div className="p-4 md:p-6 bg-gradient-to-br from-teal-50 to-blue-50/50 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3 text-teal-600">
                                                    <div className="h-8 w-8 flex items-center justify-center bg-white rounded-xl shadow-sm border border-teal-100">
                                                        <FaWallet size={14} />
                                                    </div>
                                                    <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-teal-800">Balance Summary</h3>
                                                </div>
                                                <button onClick={() => setWalletOpen(false)} className="h-6 w-6 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-white rounded-full transition-colors"><FaTimes size={12} /></button>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="bg-white rounded-[20px] p-4 text-center border border-white shadow-lg shadow-teal-900/5 relative overflow-hidden group flex-1">
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 blur-lg group-hover:bg-primary/10 transition-colors" />
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 relative z-10">Outstanding Due</p>
                                                    <p className="text-2xl font-black text-primary tracking-tighter relative z-10">₹{displayDue.toFixed(2)}</p>
                                                </div>
                                                {walletCredit > 0 && (
                                                    <div className="bg-amber-50 rounded-[20px] p-4 text-center border border-amber-100 shadow-sm relative overflow-hidden group flex-1">
                                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5 relative z-10">Credit Balance</p>
                                                        <p className="text-2xl font-black text-amber-600 tracking-tighter relative z-10">₹{walletCredit.toFixed(2)}</p>
                                                    </div>
                                                )}
                                                <Link
                                                    to="/customer/payment"
                                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-teal-200 transition-all active:scale-95"
                                                    onClick={() => setWalletOpen(false)}
                                                >
                                                    <FaPlus /> Add Payment Proof
                                                </Link>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>

                            {/* Cart Dropdown Trigger */}
                            <div className="relative" ref={cartRef}>
                                <button
                                    onClick={() => { setCartOpen(!cartOpen); setProfileOpen(false); setWalletOpen(false); }}
                                    className={`relative p-2 rounded-xl transition-all ${cartOpen ? 'bg-teal-50 shadow-sm' : 'hover:bg-gray-50'}`}
                                >
                                    <FaShoppingCart className="text-sm sm:text-xl text-[#0d9488]" />
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white rounded-full text-[7px] sm:text-[9px] flex items-center justify-center font-black border border-white">
                                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                        </span>
                                    )}
                                </button>

                                {cartOpen && (
                                    <div className="fixed md:absolute top-24 md:top-auto inset-x-4 md:inset-x-auto md:right-0 mt-3 md:w-80 bg-white rounded-[28px] shadow-2xl border border-gray-100 p-6 z-[120] animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-6 px-1">
                                            <h4 className="font-extrabold text-gray-800 uppercase text-[10px] tracking-widest">My Medical Cart</h4>
                                            <button onClick={() => setCartOpen(false)} className="text-gray-300 hover:text-gray-500"><FaTimes /></button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto no-scrollbar mb-6 space-y-4">
                                            {cartItems.length > 0 ? cartItems.map(item => (
                                                <div key={item._id} className="flex gap-4 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
                                                    <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                                        {item.imageUrl ? <img src={item.imageUrl} className="h-full object-contain" alt={item.name} /> : '💊'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden scale-75 origin-left">
                                                                <button onClick={() => updateQuantity(item._id, -1)} className="px-2 py-1 hover:bg-white text-gray-400 hover:text-primary"><FaMinus size={10} /></button>
                                                                <span className="px-2 font-bold text-primary min-w-[15px] text-center text-[10px]">{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item._id, 1)} className="px-2 py-1 hover:bg-white text-gray-400 hover:text-primary"><FaPlus size={10} /></button>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">₹{item.cost || item.price}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 shrink-0 self-center"><FaTrash size={12} /></button>
                                                </div>
                                            )) : <p className="text-[10px] font-bold text-gray-400 text-center py-8 uppercase tracking-widest">Your cart is empty</p>}
                                        </div>
                                        {cartItems.length > 0 && (
                                            <button onClick={() => { navigate('/customer/cart'); setCartOpen(false); }} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-lg shadow-teal-100 transition-all text-sm uppercase tracking-widest">
                                                Checkout ₹{cartTotal.toFixed(2)}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown Trigger */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => { setProfileOpen(!profileOpen); setCartOpen(false); setWalletOpen(false); }}
                                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${profileOpen ? 'bg-teal-50 shadow-sm' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="h-7 w-7 md:h-10 md:w-10 rounded-[10px] md:rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] p-[1.5px] transition-transform shadow-sm">
                                        <div className="h-full w-full rounded-[8px] md:rounded-[14px] bg-white flex items-center justify-center text-[#0d9488] font-black uppercase overflow-hidden text-[10px] md:text-base">
                                            {user?.name?.[0]}
                                        </div>
                                    </div>
                                    <div className="text-left hidden md:block pr-2">
                                        <p className="text-[11px] font-black text-gray-800 leading-none mb-0.5 whitespace-nowrap">{formatDisplayName(user?.name, user?.type)}</p>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Premium Partner</p>
                                    </div>
                                </button>

                                {profileOpen && (
                                    <div className="fixed md:absolute top-24 md:top-auto inset-x-4 md:inset-x-auto md:right-0 mt-3 md:w-80 bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden z-[120] animate-in fade-in zoom-in duration-200">
                                        <div className="p-4 bg-gradient-to-br from-teal-600 to-teal-500 text-white text-center">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-70">Connected Account</p>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-14 w-14 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black shadow-xl border border-white/10 ring-4 ring-white/5">
                                                    {user?.name?.[0]}
                                                </div>
                                                <h4 className="text-lg font-black tracking-tight">{user?.name}</h4>
                                            </div>
                                        </div>
                                        <div className="p-5 pb-8 bg-gray-50/50 space-y-3">
                                            <div className="p-5 bg-white rounded-3xl border border-gray-100 space-y-5 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                                        <FaMobileAlt size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Mobile Number</p>
                                                        <p className="text-xs font-black text-gray-800">{user?.phone || 'Add phone number'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <FaAt size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Email Address</p>
                                                        <p className="text-xs font-black text-gray-800 truncate">{user?.email || 'Add email'}</p>
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Pharmacy Address</p>
                                                    <p className="text-xs font-black text-gray-800 line-clamp-2 leading-tight">
                                                        {user?.address && Object.values(user.address).some(v => v)
                                                            ? formatAddress(user?.address)
                                                            : 'Complete your profile address'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => { setEditModalOpen(true); setProfileOpen(false); }}
                                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all group"
                                                >
                                                    <div className="h-9 w-9 shrink-0 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                        <FaUserCircle size={18} />
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest leading-none mb-0.5">Edit</p>
                                                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none">Profile</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/customer/orders'); setProfileOpen(false); }}
                                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all group"
                                                >
                                                    <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <FaReceipt size={18} />
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest leading-none mb-0.5">Order</p>
                                                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none">History</p>
                                                    </div>
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] group shadow-sm hover:shadow-lg hover:shadow-red-200"
                                            >
                                                <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> Sign Out Securely
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full relative">
                <Outlet />
            </main>

            <Footer />

            {/* Profile Edit Modal */}
            {
                editModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-teal-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                            <div className="p-8 bg-[#0d9488] text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black font-serif">Update Profile</h2>
                                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Refine your business information</p>
                                </div>
                                <button onClick={() => setEditModalOpen(false)} className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                            </div>
                            <form onSubmit={handleProfileUpdate} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                                {editError && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{editError}</div>}
                                <div className="space-y-4">
                                    {/* Read-Only Identity Fields */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                                        <input
                                            disabled
                                            value={profileData.name}
                                            className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500 opacity-60 cursor-not-allowed"
                                            placeholder="Full Name"
                                        />
                                        <p className="text-[10px] text-gray-400 ml-1 mt-1">Contact admin to update this field</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            disabled
                                            value={profileData.email}
                                            className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500 opacity-60 cursor-not-allowed"
                                            placeholder="Email"
                                        />
                                        <p className="text-[10px] text-gray-400 ml-1 mt-1">Contact admin to update this field</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                                        <input
                                            disabled
                                            value={profileData.phone}
                                            className="w-full px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500 opacity-60 cursor-not-allowed"
                                            placeholder="+91"
                                        />
                                        <p className="text-[10px] text-gray-400 ml-1 mt-1">Contact admin to update this field</p>
                                    </div>

                                    {/* Editable Address Section */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1 mb-3">Editable Address</p>
                                    </div>
                                    <StructuredAddressForm
                                        address={profileData.address}
                                        onChange={(address) => setProfileData({ ...profileData, address })}
                                        title="Shipping Address"
                                        showShopName={false}
                                    />
                                </div>
                                <button type="submit" disabled={editSaving} className="w-full py-5 bg-teal-600 text-white rounded-[24px] font-black shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95">
                                    {editSaving ? 'UPDATING...' : 'SAVE CHANGES'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CustomerLayout;
