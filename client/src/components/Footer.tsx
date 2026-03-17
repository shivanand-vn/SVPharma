import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaEdit, FaPills, FaHeartbeat, FaPlus, FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaLink } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ShopEditModal } from './FooterEditModals';
import type { SiteSettings } from './FooterEditModals';
import Logo from '../assets/Logo.png';

const Footer = () => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShopModal, setShowShopModal] = useState(false);

    // Initial Animation State
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

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

    // Static Developer Data
    const developerInfo = {
        name: "Shivanand VN",
        email: "shivanandvn.mca@gmail.com",
        mobile: "8197682353",
        linkedin: "https://www.linkedin.com/in/shivanand-viranna-naganur-253019316",
        portfolio: "https://shivanandvn.vercel.app/",
        role: "Technical Partner",
        description: "Specializing in pharmaceutical and healthcare fintech ecosystems."
    };

    const isAdmin = user?.role === 'admin';

    // Helper for safe rendering of dynamic data
    const renderAdminField = (field: string | undefined, placeholder: string = '...') => {
        return settings ? field : <span className="animate-pulse bg-gray-800 rounded px-4 text-transparent">{placeholder}</span>;
    };

    return (
        <footer className={`bg-[#0f172a] text-white pt-20 pb-10 border-t border-gray-800 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} relative overflow-hidden`}>
            {/* Medical Animations / Decorations */}
            {/* Background Pattern - Hex Mesh */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232dd4bf' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Glowing Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            {/* ECG Line Animation */}
            <div className="absolute bottom-1/3 left-0 w-full opacity-10 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="min-w-full h-24">
                    <path
                        d="M0 75 Q 100 75 125 75 L 135 10 L 145 140 L 155 75 Q 250 75 500 75"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-teal-400 animate-ecg"
                        strokeDasharray="2000"
                    />
                </svg>
            </div>

            {/* Floating Icons */}
            <div className="absolute top-20 right-20 opacity-20 pointer-events-none animate-float-slow">
                <FaPills className="text-8xl text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)] transform rotate-12" />
            </div>
            <div className="absolute bottom-20 left-10 opacity-20 pointer-events-none animate-pulse-slow">
                <FaHeartbeat className="text-7xl text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
                <FaPlus className="text-[30rem] text-teal-100 animate-spin-slow" />
            </div>

            <div className="container mx-auto px-6 lg:px-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">

                    {/* Section A: Company Information */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-2xl shadow-lg shadow-white/5">
                                <img src={Logo} alt="Logo" className="h-12 w-auto object-contain" />
                            </div>
                            <div className="relative group">
                                <h3 className="text-2xl font-black tracking-tight font-serif leading-tight min-h-[32px] flex items-center">
                                    {renderAdminField(settings?.appName, 'SV Pharma')}
                                </h3>
                                {isAdmin && settings && (
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
                                { icon: <FaInstagram />, link: settings?.instagram, color: 'hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' },
                                { icon: <FaWhatsapp />, link: settings?.whatsapp, color: 'hover:bg-green-500' },
                                { icon: <FaEnvelope />, link: settings?.email ? `mailto:${settings.email}` : undefined, color: 'hover:bg-blue-50' },
                                { icon: <FaFacebook />, link: settings?.facebook, color: 'hover:bg-blue-600' }
                            ].map((social, idx) => (
                                (social.link || !settings) && (
                                    <a
                                        key={idx}
                                        href={social.link || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:text-white shadow-xl ${social.color} ${!settings ? 'animate-pulse' : ''}`}
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
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-teal-500 mb-6 flex items-center gap-2">
                                Contact Details
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                            </h4>
                            {isAdmin && settings && (
                                <button
                                    onClick={() => setShowShopModal(true)}
                                    className="absolute -right-8 top-0 p-2 bg-teal-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                >
                                    <FaEdit size={12} />
                                </button>
                            )}
                        </div>
                        <ul className="space-y-6 text-gray-300">
                            <li className="flex items-start gap-4 group cursor-default">
                                {settings?.shopLocationLink ? (
                                    <a
                                        href={settings.shopLocationLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 relative overflow-hidden hover:scale-110 shadow-lg cursor-pointer"
                                    >
                                        <FaMapMarkerAlt size={18} className="relative z-10" />
                                        <div className="absolute inset-0 bg-teal-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </a>
                                ) : (
                                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 relative overflow-hidden">
                                        <FaMapMarkerAlt size={18} className="relative z-10" />
                                        <div className="absolute inset-0 bg-teal-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Address</p>
                                    <div className="font-medium leading-relaxed text-sm">
                                        {!settings ? (
                                            <div className="space-y-2 py-1">
                                                <div className="h-4 w-40 bg-gray-800 animate-pulse rounded"></div>
                                                <div className="h-4 w-32 bg-gray-800 animate-pulse rounded"></div>
                                            </div>
                                        ) : (
                                            [
                                                [settings.address.floor, settings.address.building].filter(Boolean).join(', '),
                                                settings.address.area,
                                                [settings.address.city, settings.address.pincode].filter(Boolean).join(' - '),
                                                [settings.address.taluk && `Taluk: ${settings.address.taluk}`, settings.address.district && `District: ${settings.address.district}`].filter(Boolean).join(', '),
                                                settings.address.state,
                                                settings.address.landmark && `Landmark: ${settings.address.landmark}`
                                            ].filter(Boolean).map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 relative overflow-hidden">
                                    <FaPhone size={18} className="relative z-10" />
                                    <div className="absolute inset-0 bg-teal-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone Numbers</p>
                                    <div className="flex flex-col gap-1">
                                        {!settings ? (
                                            <div className="h-5 w-32 bg-gray-800 animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <>
                                                {settings.contacts?.map((contact, idx) => (
                                                    <a key={idx} href={`tel:${contact.phone}`} className="hover:text-teal-400 transition-colors flex items-center gap-2 group/link">
                                                        {contact.name && (
                                                            <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase group-hover/link:bg-teal-900 group-hover/link:text-teal-400 transition-colors">
                                                                {contact.name}
                                                            </span>
                                                        )}
                                                        {contact.phone}
                                                    </a>
                                                ))}
                                                {(!settings.contacts || settings.contacts.length === 0) && settings.phone && (
                                                    <a href={`tel:${settings.phone}`} className="hover:text-teal-400 transition-colors flex items-center gap-2">
                                                        <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase">Main</span>
                                                        {settings.phone}
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group cursor-default">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-800/50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 relative overflow-hidden">
                                    <FaEnvelope size={18} className="relative z-10" />
                                    <div className="absolute inset-0 bg-teal-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                                    <div className="min-h-[20px]">
                                        {!settings ? (
                                            <div className="h-4 w-40 bg-gray-800 animate-pulse rounded mt-1"></div>
                                        ) : (
                                            <a href={`mailto:${settings.email}`} className="hover:text-teal-400 transition-colors lowercase">{settings.email}</a>
                                        )}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Section C: Developed By (STATIC) */}
                    <div className="space-y-8">
                        <div className="relative group">
                            <div className="bg-[#1e293b] rounded-[32px] p-8 border border-gray-700 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-teal-900/10 hover:border-teal-900/30">
                                {/* Decorative elements */}
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
                                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em] mb-4 opacity-70">
                                        {developerInfo.role}
                                    </p>
                                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                                        {developerInfo.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium mb-6">
                                        {developerInfo.description}
                                    </p>

                                    <div className="flex items-center gap-4 mb-6 relative z-20">
                                        <a
                                            href={`mailto:${developerInfo.email}`}
                                            title="Email Developer"
                                            className="h-9 w-9 flex items-center justify-center rounded-full bg-[#0f172a] text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:bg-blue-500 hover:text-white shadow-lg border border-gray-700 hover:border-blue-500"
                                        >
                                            <FaEnvelope size={16} />
                                        </a>
                                        <a
                                            href={`tel:${developerInfo.mobile}`}
                                            title="Call Developer"
                                            className="h-9 w-9 flex items-center justify-center rounded-full bg-[#0f172a] text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:bg-green-500 hover:text-white shadow-lg border border-gray-700 hover:border-green-500"
                                        >
                                            <FaPhone size={16} />
                                        </a>
                                        <a
                                            href={developerInfo.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="LinkedIn Profile"
                                            className="h-9 w-9 flex items-center justify-center rounded-full bg-[#0f172a] text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:bg-[#0077b5] hover:text-white shadow-lg border border-gray-700 hover:border-[#0077b5]"
                                        >
                                            <FaLinkedin size={16} />
                                        </a>
                                        <a
                                            href={developerInfo.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Developer Portfolio"
                                            className="h-9 w-9 flex items-center justify-center rounded-full bg-[#0f172a] text-gray-400 transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-500 hover:text-white shadow-lg border border-gray-700 hover:border-teal-500"
                                        >
                                            <FaGlobe size={16} />
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Partner</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} <span className="text-gray-300">{settings?.appName || 'SV Pharma'}</span>. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
                        <Link to="/privacy-policy" className="hover:text-teal-500 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-teal-500 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Shop Edit Modal */}
            {isAdmin && settings && (
                <ShopEditModal
                    isOpen={showShopModal}
                    onClose={() => setShowShopModal(false)}
                    settings={settings}
                    onSuccess={fetchSettings}
                />
            )}
        </footer>
    );
};

export default Footer;
