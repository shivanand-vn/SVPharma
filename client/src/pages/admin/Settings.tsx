import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaSave, FaGlobe, FaCode, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPlus, FaTrash } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import type { Address } from '../../components/StructuredAddressForm';

import { useNotification } from '../../context/NotificationContext';

const Settings = () => {
    const [settings, setSettings] = useState({
        appName: '',
        email: '',
        phone: '',
        contactNumbers: [] as { label: string, number: string }[],
        address: {
            line1: '',
            city: '',
            state: '',
            pincode: ''
        } as Address,
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
                if (data) setSettings(data);
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

    const handleContactChange = (index: number, field: 'label' | 'number', value: string) => {
        const newContacts = [...settings.contactNumbers];
        if (field === 'number') {
            // Basic number/formatted cleaning if desired, or just allow input
            value = value.replace(/[^\d\s\-\+]/g, '').slice(0, 15);
        }
        newContacts[index] = { ...newContacts[index], [field]: value };
        setSettings({ ...settings, contactNumbers: newContacts });
    };

    const addContact = () => {
        setSettings({
            ...settings,
            contactNumbers: [...settings.contactNumbers, { label: '', number: '' }]
        });
    };

    const removeContact = (index: number) => {
        const newContacts = settings.contactNumbers.filter((_, i) => i !== index);
        setSettings({ ...settings, contactNumbers: newContacts });
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
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">App / Business Name</label>
                            <input
                                name="appName"
                                value={settings.appName}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold text-gray-700"
                                placeholder="e.g. Shree Veerabhadreshwara Pharma"
                            />
                        </div>
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                            <div className="relative">
                                <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    name="phone"
                                    type="tel"
                                    value={settings.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setSettings({ ...settings, phone: value });
                                    }}
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold text-gray-700"
                                    placeholder="10-digit mobile number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Multiple Contact Numbers */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Additional Contact Numbers</label>
                            <button
                                type="button"
                                onClick={addContact}
                                className="text-[10px] font-black uppercase tracking-widest text-teal-600 flex items-center gap-1 hover:text-teal-800 transition-colors"
                            >
                                <FaPlus size={10} /> Add Number
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.contactNumbers?.map((contact, index) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-50 p-2 rounded-2xl border border-gray-100 group hover:border-teal-200 transition-colors">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Sales, Support)"
                                            value={contact.label}
                                            onChange={(e) => handleContactChange(index, 'label', e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 border border-gray-100 focus:border-teal-400 focus:outline-none placeholder:text-gray-300 uppercase tracking-wide"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={contact.number}
                                            onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-xl text-sm font-black text-gray-800 border border-gray-100 focus:border-teal-400 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ))}
                            {(!settings.contactNumbers || settings.contactNumbers.length === 0) && (
                                <div className="md:col-span-2 text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-xs font-bold">
                                    No additional numbers added
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2">
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
