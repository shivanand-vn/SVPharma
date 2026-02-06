import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaSave, FaBuilding, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import { Address, emptyAddress, normalizeAddress } from '../../types/address';
import { useNotification } from '../../context/NotificationContext';

const AdminProfile = () => {
    const [settings, setSettings] = useState({
        appName: '',
        email: '',
        phone: '',
        address: { ...emptyAddress },
        facebook: '',
        twitter: '',
        instagram: '',
        whatsapp: '',
        linkedin: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data) {
                    setSettings({
                        appName: data.appName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: normalizeAddress(data.address),
                        facebook: data.facebook || '',
                        twitter: data.twitter || '',
                        instagram: data.instagram || '',
                        whatsapp: data.whatsapp || '',
                        linkedin: data.linkedin || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
                showNotification('Failed to load settings', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Mobile Number Validation
        if (settings.phone && !/^[6-9]\d{9}$/.test(settings.phone)) {
            showNotification('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'error');
            return;
        }

        setSaving(true);
        try {
            const { data } = await api.put('/settings/shop', settings);
            setSettings({
                appName: data.appName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || {} as Address,
                facebook: data.facebook || '',
                twitter: data.twitter || '',
                instagram: data.instagram || '',
                whatsapp: data.whatsapp || '',
                linkedin: data.linkedin || ''
            });
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            showNotification('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
                {/* Header - Identical to Customer Profile Modal */}
                <div className="p-8 bg-[#0d9488] text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black font-serif uppercase tracking-tight">Admin Profile</h2>
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Refine shop information & social identity</p>
                    </div>
                    <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Section: General Info */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="pt-2 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <FaBuilding className="text-teal-600" />
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">General Information</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">App Name</label>
                                <input
                                    name="appName"
                                    value={settings.appName}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                    placeholder="Application Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section: Contact Details */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="pt-2 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <FaPhone className="text-teal-600" />
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Contact Details</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Phone</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={settings.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setSettings({ ...settings, phone: value });
                                        }}
                                        className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Shop Address */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="pt-2 border-b border-gray-100 pb-2">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">Shop Address</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                                <StructuredAddressForm
                                    address={settings.address}
                                    onChange={(address) => setSettings({ ...settings, address })}
                                    title=""
                                    showShopName={false}
                                />
                            </div>
                        </div>

                        {/* Section: Social Media */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="pt-2 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <FaFacebook className="text-teal-600" />
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Social Media Links</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'facebook', label: 'Facebook', icon: <FaFacebook />, placeholder: 'https://fb.com/...' },
                                    { name: 'twitter', label: 'Twitter', icon: <FaTwitter />, placeholder: 'https://twitter.com/...' },
                                    { name: 'instagram', label: 'Instagram', icon: <FaInstagram />, placeholder: 'https://insta.com/...' },
                                    { name: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp />, placeholder: 'https://wa.me/...' },
                                    { name: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin />, placeholder: 'https://linkedin.com/...' }
                                ].map((social) => (
                                    <div key={social.name} className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                            {social.label}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                name={social.name}
                                                value={(settings as any)[social.name]}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                                placeholder={social.placeholder}
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                                {social.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-5 bg-teal-600 text-white rounded-[24px] font-black shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                <span>UPDATING...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="text-xl" />
                                <span>SAVE CHANGES</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
