import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaSave, FaGlobe, FaCode, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPlus, FaTrash } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import { Address, emptyAddress, normalizeAddress } from '../../types/address';

import { useNotification } from '../../context/NotificationContext';

const Settings = () => {
    const [settings, setSettings] = useState({
        appName: '',
        email: '',
        phone: '', // Keep for legacy/sync
        contacts: [] as { name: string, phone: string }[],
        address: { ...emptyAddress },
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        developerName: '',
        developerLink: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotification();


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data) {
                    // Ensure contacts & address have default structure if missing
                    setSettings(prev => ({
                        ...prev,
                        ...data,
                        contacts: data.contacts || [],
                        address: { ...prev.address, ...(data.address || {}) }
                    }));
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                showNotification("Failed to load settings", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleContactChange = (index: number, field: 'name' | 'phone', value: string) => {
        const newContacts = [...settings.contacts];
        if (field === 'phone') {
            value = value.replace(/[^\d]/g, '').slice(0, 10);
        }
        newContacts[index] = { ...newContacts[index], [field]: value };
        setSettings({ ...settings, contacts: newContacts });
    };

    const addContact = () => {
        setSettings({
            ...settings,
            contacts: [...settings.contacts, { name: '', phone: '' }]
        });
    };

    const removeContact = (index: number) => {
        const newContacts = settings.contacts.filter((_, i) => i !== index);
        setSettings({ ...settings, contacts: newContacts });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Contact Validation
        if (!settings.contacts || settings.contacts.length === 0) {
            showNotification('At least one contact number is mandatory', 'error');
            return;
        }

        for (const contact of settings.contacts) {
            if (!contact.name || !contact.phone) {
                showNotification('All contact fields (Name & Phone) are required', 'error');
                return;
            }
            if (!/^[6-9]\d{9}$/.test(contact.phone)) {
                showNotification(`Invalid phone number for ${contact.name}: Must be 10 digits starting with 6-9`, 'error');
                return;
            }
        }

        // Pincode Validation
        if (!/^\d{6}$/.test(settings.address.pincode)) {
            showNotification('Pincode must be exactly 6 digits', 'error');
            return;
        }

        setSaving(true);
        try {
            await api.put('/settings', settings);
            showNotification('Settings updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update settings", error);
            showNotification('Failed to update settings.', 'error');
        } finally {
            setSaving(false);
        }
    };


    if (loading) return <div className="p-8 text-center text-teal-600 font-bold">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-3xl font-extrabold text-teal-900 font-serif">Site Settings</h2>
                    <p className="text-teal-600 font-bold text-xs uppercase tracking-widest mt-1">Manage global app details and developer attribution</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* General Settings */}
                <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-xl shadow-teal-900/5">
                    <div className="flex items-center gap-3 mb-6 text-teal-800">
                        <FaGlobe size={20} />
                        <h3 className="text-xl font-bold">General Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">App / Business Name</label>
                            <input
                                name="appName"
                                value={settings.appName}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold text-gray-700"
                                placeholder="e.g. Shree Veerabhadreshwara Pharma"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    name="email"
                                    value={settings.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold text-gray-700"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-8 border-t border-gray-100" />

                    {/* Contact Numbers List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-teal-800">
                                <FaPhone size={16} />
                                <h4 className="font-bold text-sm uppercase tracking-wide">Contact Numbers</h4>
                            </div>
                            <button
                                type="button"
                                onClick={addContact}
                                className="text-[10px] bg-teal-50 text-teal-700 px-3 py-2 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-100 transition-colors"
                            >
                                <FaPlus size={10} /> Add Contact
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.contacts?.map((contact, index) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-2xl border border-gray-100 group hover:border-teal-200 transition-colors">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Sales, Owner)"
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 border border-gray-100 focus:border-teal-400 focus:outline-none placeholder:text-gray-300 uppercase tracking-wide"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={contact.phone}
                                            maxLength={10}
                                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-xl text-sm font-black text-gray-800 border border-gray-100 focus:border-teal-400 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all h-full flex items-center justify-center"
                                        title="Remove Contact"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                            {(!settings.contacts || settings.contacts.length === 0) && (
                                <div className="md:col-span-2 text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-xs font-bold">
                                    No contact numbers added. Please add at least one.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="my-8 border-t border-gray-100" />

                    {/* Address Section */}
                    <div>
                        <StructuredAddressForm
                            address={settings.address}
                            onChange={(address) => setSettings({ ...settings, address })}
                            title="Physical Address"
                            showShopName={false}
                        />
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-xl shadow-teal-900/5">
                    <h3 className="text-xl font-bold mb-6 text-teal-800">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <FaFacebook className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" />
                            <input name="facebook" value={settings.facebook} onChange={handleChange} className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none font-medium" placeholder="Facebook URL" />
                        </div>
                        <div className="relative">
                            <FaTwitter className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-400" />
                            <input name="twitter" value={settings.twitter} onChange={handleChange} className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none font-medium" placeholder="Twitter URL" />
                        </div>
                        <div className="relative">
                            <FaInstagram className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-600" />
                            <input name="instagram" value={settings.instagram} onChange={handleChange} className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none font-medium" placeholder="Instagram URL" />
                        </div>
                        <div className="relative">
                            <FaLinkedin className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-800" />
                            <input name="linkedin" value={settings.linkedin} onChange={handleChange} className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none font-medium" placeholder="LinkedIn URL" />
                        </div>
                    </div>
                </div>

                {/* Developer Attribution */}
                <div className="bg-teal-900 rounded-3xl p-8 border border-white/10 shadow-xl shadow-teal-900/40 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><FaCode size={120} /></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <FaCode size={20} className="text-teal-400" />
                        <h3 className="text-xl font-bold">Developer Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest ml-1">Developer Name</label>
                            <input
                                name="developerName"
                                value={settings.developerName}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 outline-none transition-all font-bold"
                                placeholder="Developer or Team Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest ml-1">Portfolio/Website Link</label>
                            <input
                                name="developerLink"
                                value={settings.developerLink}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 outline-none transition-all font-bold"
                                placeholder="https://portfolio.com"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-teal-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <FaSave /> {saving ? 'Saving Changes...' : 'Save Global Settings'}
                </button>
            </form >
        </div >
    );
};

export default Settings;
