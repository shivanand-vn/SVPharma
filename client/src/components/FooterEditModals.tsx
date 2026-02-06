import React, { useState } from 'react';
import { FaTimes, FaSave, FaStore, FaUserCircle, FaInfoCircle, FaMapMarkedAlt, FaWhatsapp, FaInstagram, FaCheck } from 'react-icons/fa';
import api from '../utils/api';
import { Address } from '../types/address';

export interface SiteSettings {
    appName: string;
    email: string;
    phone: string;
    address: Address;
    facebook: string;
    twitter: string;
    instagram: string;
    whatsapp: string;
    linkedin: string;
    contacts: {
        name: string;
        phone: string;
    }[];
    developerName: string;
    developerDescription: string;
    developerRoleName: string;
    developerLink: string;
    developerProfileLink: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SiteSettings;
    onSuccess: () => void;
}

export const ShopEditModal = ({ isOpen, onClose, settings, onSuccess }: ModalProps) => {
    const [formData, setFormData] = useState({
        appName: settings.appName,
        email: settings.email,
        phone: settings.phone,
        address: { ...settings.address },
        instagram: settings.instagram,
        whatsapp: settings.whatsapp,
        facebook: settings.facebook
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/settings/shop', formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to update shop settings", error);
            alert("Failed to update shop settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="bg-teal-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <FaStore size={24} />
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Shop Configuration</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Admin Perspective</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all"><FaTimes size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name</label>
                            <input
                                type="text"
                                value={formData.appName}
                                onChange={e => setFormData({ ...formData, appName: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                            required
                        />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-teal-600">
                            <FaMapMarkedAlt />
                            <h3 className="text-xs font-black uppercase tracking-widest">Address Details</h3>
                        </div>
                        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Area"
                                    value={formData.address.area}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, area: e.target.value } })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-800"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.address.city}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-800"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.address.state}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-800"
                                />
                                <input
                                    type="text"
                                    placeholder="Pincode"
                                    value={formData.address.pincode}
                                    onChange={e => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-800"
                                />
                            </div>
                            <div className="text-xs text-gray-400 text-center italic">
                                Use the main Settings page for detailed address editing (Floor, District, etc).
                            </div>
                        </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <FaInstagram />
                            <h3 className="text-xs font-black uppercase tracking-widest">Social Eco-system</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <FaInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                                <input
                                    type="text"
                                    placeholder="Instagram URL"
                                    value={formData.instagram}
                                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-gray-800"
                                />
                            </div>
                            <div className="relative">
                                <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                <input
                                    type="text"
                                    placeholder="WhatsApp Link"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 py-4 px-10 bg-teal-600 text-white text-sm font-black rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FaSave /> {loading ? 'Saving...' : 'Deploy Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const DeveloperEditModal = ({ isOpen, onClose, settings, onSuccess }: ModalProps) => {
    const [formData, setFormData] = useState({
        developerName: settings.developerName,
        developerDescription: settings.developerDescription,
        developerRoleName: settings.developerRoleName,
        developerLink: settings.developerLink,
        developerProfileLink: settings.developerProfileLink || ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/settings/developer', formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to update developer settings", error);
            alert("Failed to update developer settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden border border-gray-800 animate-in slide-in-from-bottom-10 duration-500">
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <FaUserCircle size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Technical Profile</h2>
                            <p className="text-xs font-bold text-teal-100 opacity-80">Developer Ecosystem Editor</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <FaInfoCircle className="text-blue-500" /> Professional Identity
                        </label>
                        <input
                            type="text"
                            value={formData.developerName}
                            onChange={e => setFormData({ ...formData, developerName: e.target.value })}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Shivanand VN"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Role Identification</label>
                        <input
                            type="text"
                            value={formData.developerRoleName}
                            onChange={e => setFormData({ ...formData, developerRoleName: e.target.value })}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Technical Partner / System Architect"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Project Synopsis</label>
                        <textarea
                            value={formData.developerDescription}
                            onChange={e => setFormData({ ...formData, developerDescription: e.target.value })}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                            placeholder="Describe your role and expertise..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Profile URL / Portfolio</label>
                        <input
                            type="text"
                            value={formData.developerProfileLink}
                            onChange={e => setFormData({ ...formData, developerProfileLink: e.target.value })}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="https://yourportfolio.com"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-sm font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 py-4 px-12 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FaCheck /> {loading ? 'Syncing...' : 'Update Ecosystem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
