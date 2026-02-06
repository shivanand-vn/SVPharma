import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaSave, FaBuilding, FaPhone, FaCode, FaFacebook, FaPlus, FaTrash } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import { emptyAddress } from '../../types/address';

const ShopProfile = () => {
    const [settings, setSettings] = useState({
        appName: '',
        email: '',
        phone: '',
        contacts: [] as { name: string, phone: string }[],
        address: { ...emptyAddress },
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
                // Ensure contacts array exists
                setSettings({ ...data, contacts: data.contacts || [] });
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleContactChange = (index: number, field: 'name' | 'phone', value: string) => {
        const newContacts = [...settings.contacts];
        if (field === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
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

        // Validation
        if (settings.contacts && settings.contacts.length > 0) {
            for (const contact of settings.contacts) {
                if (!contact.phone || !/^[6-9]\d{9}$/.test(contact.phone)) {
                    setMessage(`Invalid phone number for ${contact.name || 'Contact'}: Must be 10 digits starting with 6-9`);
                    return;
                }
            }
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-teal-700"><FaPhone /> Contact Details</h3>
                        <button
                            type="button"
                            onClick={addContact}
                            className="text-xs bg-teal-50 text-teal-700 px-3 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-100 transition-colors"
                        >
                            <FaPlus size={10} /> Add Mobile
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Dynamic Contact List */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-sm font-bold text-gray-700">Phone Numbers</label>
                            {settings.contacts.length === 0 && (
                                <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                                    No contacts added. Click "Add Mobile" to add contacts.
                                </div>
                            )}
                            {settings.contacts.map((contact, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Name (e.g. Sales)"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                        className="w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={contact.phone}
                                        maxLength={10}
                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="md:col-span-2">
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
