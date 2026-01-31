import { useEffect, useState, useContext } from 'react';
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaEdit } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Logo from '../assets/Logo.png';
import { ShopEditModal, DeveloperEditModal } from './FooterEditModals';
import type { SiteSettings } from './FooterEditModals';

const Footer = () => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShopModal, setShowShopModal] = useState(false);
    const [showDevModal, setShowDevModal] = useState(false);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            if (data) setSettings(data);
        } catch (error) {
            console.error("Failed to load footer settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading || !settings) return null;

    const isAdmin = user?.role === 'admin';
    const isDeveloper = user?.role === 'developer';

    const formatAddress = (addr: SiteSettings['address']) => {
        const parts = [addr.line1, addr.line2, addr.area, addr.city, addr.state, addr.pincode].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <footer className="bg-[#0f172a] text-white pt-20 pb-10 border-t border-gray-800">
            <div className="container mx-auto px-6 lg:px-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">

                    {/* Section A: Company Information */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-2xl shadow-lg shadow-white/5">
                                <img src={Logo} alt="Logo" className="h-12 w-auto object-contain" />
                            </div>
                            <div className="relative group">
                                <h3 className="text-2xl font-black tracking-tight font-serif leading-tight">
                                    {settings.appName}
                                </h3>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowShopModal(true)}
                                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                    >
                                        <FaEdit size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed font-medium max-w-sm">
                            Quality medicines delivered with care and precision. Your trusted distribution partner for a healthier community.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: <FaInstagram />, link: settings.instagram, color: 'hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' },
                                { icon: <FaWhatsapp />, link: settings.whatsapp, color: 'hover:bg-green-500' },
                                { icon: <FaEnvelope />, link: `mailto:${settings.email}`, color: 'hover:bg-blue-500' },
                                { icon: <FaFacebook />, link: settings.facebook, color: 'hover:bg-blue-600' }
                            ].map((social, idx) => (
                                social.link && (
                                    <a
                                        key={idx}
                                        href={social.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:text-white shadow-xl ${social.color}`}
                                    >
                                        {social.icon}
                                    </a>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Section B: Contact Details */}
                    <div className="space-y-8">
                        <div className="relative inline-block group">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-teal-500 mb-6">Contact Details</h4>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowShopModal(true)}
                                    className="absolute -right-8 top-0 p-2 bg-teal-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                >
                                    <FaEdit size={12} />
                                </button>
                            )}
                        </div>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                    <FaMapMarkerAlt size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Address</p>
                                    <p className="text-gray-300 font-medium leading-relaxed">{formatAddress(settings.address)}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                    <FaPhone size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone Number</p>
                                    <a href={`tel:${settings.phone}`} className="text-gray-300 font-medium hover:text-teal-400 transition-colors">{settings.phone}</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                    <FaEnvelope size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                                    <a href={`mailto:${settings.email}`} className="text-gray-300 font-medium hover:text-teal-400 transition-colors lowercase">{settings.email}</a>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Section C: Developed By */}
                    <div className="space-y-8">
                        <div className="relative group">
                            <div className="bg-[#1e293b] rounded-[32px] p-8 border border-gray-700 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-teal-900/10 hover:border-teal-900/30">
                                {/* Decorative elements */}
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
                                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-4 opacity-70">
                                        {settings.developerRoleName || 'Technical Partner'}
                                    </p>
                                    <a
                                        href={settings.developerProfileLink || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-2xl font-black text-white mb-3 tracking-tight hover:text-teal-400 transition-colors block"
                                    >
                                        {settings.developerName}
                                    </a>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium mb-6">
                                        {settings.developerDescription || 'Specializing in pharmaceutical and healthcare fintech ecosystems.'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Partner</span>
                                    </div>
                                </div>
                            </div>

                            {isDeveloper && (
                                <button
                                    onClick={() => setShowDevModal(true)}
                                    className="absolute -right-4 -top-4 p-3 bg-teal-600 text-white rounded-full shadow-xl hover:scale-110 transition-all z-20 group-hover:animate-bounce"
                                >
                                    <FaEdit size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} <span className="text-gray-300">{settings.appName}</span>. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
                        <button className="hover:text-teal-500 transition-colors">Privacy Policy</button>
                        <button className="hover:text-teal-500 transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isAdmin && settings && (
                <ShopEditModal
                    isOpen={showShopModal}
                    onClose={() => setShowShopModal(false)}
                    settings={settings}
                    onSuccess={fetchSettings}
                />
            )}
            {isDeveloper && settings && (
                <DeveloperEditModal
                    isOpen={showDevModal}
                    onClose={() => setShowDevModal(false)}
                    settings={settings}
                    onSuccess={fetchSettings}
                />
            )}
        </footer>
    );
};

export default Footer;
