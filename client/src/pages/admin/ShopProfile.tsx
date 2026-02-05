import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaSave, FaBuilding, FaPhone, FaCode, FaFacebook } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import type { Address } from '../../components/StructuredAddressForm';

const ShopProfile = () => {
    const [settings, setSettings] = useState({
        appName: '',
        email: '',
        phone: '',
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
        developerLink: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
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
            setMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const { data } = await api.put('/settings', settings);
            setSettings(data);
            setMessage('Settings updated successfully!');
        } catch (error) {
            setMessage('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };



    // UPI Change Logic
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [newUpiId, setNewUpiId] = useState('');
    const [upiLoading, setUpiLoading] = useState(false);

    const initiateUpiChange = async () => {
        setUpiLoading(true);
        setMessage('');
        try {
            await api.post('/settings/upi/request');
            setShowUpiModal(true);
            setOtp('');
            setNewUpiId('');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setUpiLoading(false);
        }
    };

    const submitUpiChange = async () => {
        if (!otp || !newUpiId) return;
        setUpiLoading(true);
        try {
            const { data } = await api.put('/settings/upi/verify', { otp, newUpiId });
            setSettings({ ...settings, upiId: data.upiId });
            setMessage('UPI ID updated successfully!');
            setShowUpiModal(false);
        } catch (error: any) {
            // Show error inside modal or main message? Main message for simplicity or alert
            alert(error.response?.data?.message || 'Verification failed');
        } finally {
            setUpiLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-teal-900 border-b pb-4">App Settings & Contact Info</h2>

            {message && <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700"><FaBuilding /> General Information</h3>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">App Name</label>
                        <input name="appName" value={settings.appName} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <StructuredAddressForm
                            address={settings.address}
                            onChange={(address) => setSettings({ ...settings, address })}
                            title="Shop Address"
                            showShopName={false}
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700"><FaPhone /> Contact Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Public Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setSettings({ ...settings, phone: value });
                                }}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="10-digit mobile number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Public Email</label>
                            <input name="email" value={settings.email} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700"><FaFacebook /> Social Media Links</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Facebook</label>
                            <input name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Twitter</label>
                            <input name="twitter" value={settings.twitter} onChange={handleChange} placeholder="https://twitter.com/..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Instagram</label>
                            <input name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn</label>
                            <input name="linkedin" value={settings.linkedin} onChange={handleChange} placeholder="https://linkedin.com/..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Developer Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700"><FaCode /> Developer Credit</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Developer Name</label>
                            <input name="developerName" value={settings.developerName} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Developer Link</label>
                            <input name="developerLink" value={settings.developerLink} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all">
                        <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>

            {/* UPI Settings Section */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-700"><FaBuilding /> Payment Settings</h3>
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Current UPI ID</label>
                        <div className="flex items-center gap-2">
                            <input
                                value={settings.upiId || ''}
                                disabled
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => initiateUpiChange()}
                                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-md transition-colors whitespace-nowrap"
                            >
                                Change UPI ID
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            To ensure security, changing the UPI ID requires OTP verification sent to the registered admin email.
                        </p>
                    </div>
                </div>
            </div>

            {/* UPI Change Modal */}
            {showUpiModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Verify & Update UPI</h3>
                        <p className="text-sm text-gray-600">
                            An OTP has been sent to your registered email. Please enter it below along with the new UPI ID.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New UPI ID</label>
                                <input
                                    value={newUpiId}
                                    onChange={(e) => setNewUpiId(e.target.value)}
                                    placeholder="e.g. business@upi"
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Enter OTP</label>
                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-center tracking-widest text-lg"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowUpiModal(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitUpiChange}
                                disabled={upiLoading || !otp || !newUpiId}
                                className="flex-1 py-3 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-colors disabled:opacity-50"
                            >
                                {upiLoading ? 'Verifying...' : 'Update Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProfile;
