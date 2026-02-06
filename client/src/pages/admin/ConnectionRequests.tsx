import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaCheck, FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserPlus } from 'react-icons/fa';
import StructuredAddressForm from '../../components/StructuredAddressForm';
import { emptyAddress, formatAddress } from '../../types/address';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 ${type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
                }`}>
                <p className="font-bold text-sm">{message}</p>
                <button onClick={onClose} className="ml-4 hover:opacity-70"><FaTimes /></button>
            </div>
        </div>
    );
};

const RejectionModal = ({ isOpen, onClose, onConfirm, loading }: any) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 animate-fade-in-up border-2 border-red-100 custom-scrollbar">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Reject Request?</h3>
                <p className="text-gray-600 mb-6 text-sm">Please provide a reason for rejection. This will be emailed to the applicant.</p>
                <textarea
                    placeholder="e.g., Incomplete documentation or Outside delivery zone"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 rounded-lg px-4 py-3 outline-none transition-all mb-6 font-medium text-gray-700 min-h-[120px]"
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-bold border-2 border-gray-100 transition-colors">Cancel</button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={loading || !reason.trim()}
                        className={`px-6 py-2.5 rounded-lg font-bold text-white transition-all ${reason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {loading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConnectionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [rejectionModal, setRejectionModal] = useState<{ open: boolean, requestId: string | null }>({ open: false, requestId: null });

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        type: 'Medical',
        email: '',
        address: { ...emptyAddress }
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/admin/connection-requests');
            setRequests(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: string, reason?: string) => {
        setLoading(true);
        try {
            await api.put(`/admin/connection-requests/${id}`, { status, rejectionReason: reason });
            showToast(`Request ${status} successfully!`, "success");
            setRejectionModal({ open: false, requestId: null });
            fetchRequests();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Action failed';
            showToast(`${status === 'approved' ? 'Approval' : 'Rejection'} Error: ${msg}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Mobile Number Validation
        if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
            showToast('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/customers', formData);
            showToast("Customer registered and credentials emailed!", "success");
            setFormData({
                name: '', phone: '', type: 'Medical', email: '',
                address: { ...emptyAddress }
            });
            fetchRequests();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Registration failed';
            showToast(`Registration Error: ${msg}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter((r: any) => r.status === activeTab);

    return (
        <div className="space-y-8">
            {/* ADD NEW CUSTOMER SECTION */}
            <div className="flex justify-center">
                <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl border border-teal-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-700"></div>
                    <h2 className="text-2xl font-bold text-teal-800 mb-8 text-center font-serif">Add New Customer</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                name="name"
                                placeholder="Customer Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Mobile No."
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData({ ...formData, phone: value });
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                required
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            {['Doctor', 'Medical'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`px-8 py-2 rounded-full border transition-all font-bold ${formData.type === type
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg scale-105'
                                        : 'bg-white text-gray-600 border-teal-100 hover:border-teal-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium md:col-span-2"
                                required
                            />
                        </div>

                        <StructuredAddressForm
                            address={formData.address}
                            onChange={(address) => setFormData({ ...formData, address })}
                            showShopName={false}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Processing...' : <><FaUserPlus /> Register Customer</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* REGISTRATION LIST SECTION */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserPlus className="text-teal-600" /> Registration Requests
                    </h2>

                    {/* Status Tabs */}
                    <div className="flex bg-teal-50 p-1 rounded-xl border border-teal-100">
                        {(['pending', 'approved', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveTab(status)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === status
                                    ? 'bg-white text-teal-800 shadow-sm'
                                    : 'text-teal-600 hover:text-teal-800'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredRequests.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 font-medium italic">
                            No {activeTab} registrations found
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {filteredRequests.map((req: any) => (
                                <li key={req._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                                                <span className="text-xs font-mono text-gray-400 uppercase border px-1 rounded bg-gray-50">{req.type}</span>
                                                {req.status !== 'pending' && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <FaEnvelope className="text-gray-400" /> {req.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaPhone className="text-gray-400" /> {req.phone}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaMapMarkerAlt className="text-gray-400" /> {formatAddress(req.address)}
                                                </div>
                                            </div>

                                            {req.rejectionReason && req.status === 'rejected' && (
                                                <div className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 italic">
                                                    <b>Rejection Reason:</b> {req.rejectionReason}
                                                </div>
                                            )}
                                        </div>

                                        {req.status === 'pending' && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleStatusUpdate(req._id, 'approved')}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectionModal({ open: true, requestId: req._id })}
                                                    disabled={loading}
                                                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <RejectionModal
                isOpen={rejectionModal.open}
                onClose={() => setRejectionModal({ open: false, requestId: null })}
                onConfirm={(reason: string) => handleStatusUpdate(rejectionModal.requestId!, 'rejected', reason)}
                loading={loading}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ConnectionRequests;
