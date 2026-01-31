import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaExclamationTriangle, FaMoneyBillWave, FaUniversity } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';

interface Payment {
    _id: string;
    customer: {
        _id: string;
        name: string;
        username: string;
        phone: string;
        email: string;
    };
    amount: number;
    transactionId?: string;
    proofUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod?: string;
    adminComment?: string;
    createdAt: string;
}

const AdminPayments = () => {
    const [upiId, setUpiId] = useState('');
    const { showNotification } = useNotification();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog States
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showProofModal, setShowProofModal] = useState(false);

    // Offline Payment States
    const [showOfflineModal, setShowOfflineModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [offlineForm, setOfflineForm] = useState({ customerId: '', amount: '' });
    const [offlineLoading, setOfflineLoading] = useState(false);

    // UPI Change State
    const [showUpiDialog, setShowUpiDialog] = useState(false);
    const [newUpiId, setNewUpiId] = useState('');
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data && data.upiId) setUpiId(data.upiId);
            } catch (error) {
                console.error("Failed to load settings", error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (showOfflineModal && customers.length === 0) {
            fetchCustomers();
        }
    }, [showOfflineModal]);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/admin/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showNotification('Failed to fetch customers', 'error');
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/payments/admin?status=${filter === 'all' ? '' : filter}`);
            setPayments(res.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedPayment) return;
        setActionLoading(true);
        try {
            await api.put(`/payments/${selectedPayment._id}/approve`);
            // Refresh
            fetchPayments();
            setShowApproveDialog(false);
            setSelectedPayment(null);
        } catch (error: any) {
            console.error('Error approving payment:', error);
            showNotification(error.response?.data?.message || 'Failed to approve payment', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPayment || !rejectReason) return;
        setActionLoading(true);
        try {
            await api.put(`/payments/${selectedPayment._id}/reject`, { reason: rejectReason });
            // Refresh
            fetchPayments();
            setShowRejectDialog(false);
            setRejectReason('');
            setSelectedPayment(null);
        } catch (error: any) {
            console.error('Error rejecting payment:', error);
            showNotification(error.response?.data?.message || 'Failed to reject payment', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOfflineSubmit = async () => {
        if (!offlineForm.customerId || !offlineForm.amount) return;

        setOfflineLoading(true);
        try {
            await api.post('/payments/offline', {
                customerId: offlineForm.customerId,
                amount: Number(offlineForm.amount)
            });
            showNotification('Offline payment recorded successfully', 'success');
            setShowOfflineModal(false);
            setShowConfirmModal(false);
            setOfflineForm({ customerId: '', amount: '' });
            fetchPayments(); // Refresh list
        } catch (error: any) {
            console.error('Error recording offline payment:', error);
            showNotification(error.response?.data?.message || 'Failed to record payment', 'error');
        } finally {
            setOfflineLoading(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const selectedCust = customers.find(c => c._id === offlineForm.customerId);
        const due = selectedCust?.pendingBalance || 0;

        if (Number(val) > due) {
            setOfflineForm({ ...offlineForm, amount: due.toString() });
        } else {
            setOfflineForm({ ...offlineForm, amount: val });
        }
    };

    const openApprove = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowApproveDialog(true);
    };

    const openReject = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowRejectDialog(true);
    };

    const openProof = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowProofModal(true);
    };

    const selectedCustDue = customers.find(c => c._id === offlineForm.customerId)?.pendingBalance || 0;

    const handleUpiRequest = async () => {
        setSendingOtp(true);
        try {
            await api.post('/settings/upi/request');
            setOtpSent(true);
            showNotification('OTP sent to your registered email.', 'success');
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            showNotification(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleUpiVerify = async () => {
        if (!otp || !newUpiId) return;
        setVerifyingOtp(true);
        try {
            await api.put('/settings/upi/verify', { otp, newUpiId });
            setUpiId(newUpiId);
            showNotification('UPI ID updated successfully!', 'success');
            setShowUpiDialog(false);
            setOtpSent(false);
            setOtp('');
            setNewUpiId('');
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            showNotification(error.response?.data?.message || 'Verification failed', 'error');
        } finally {
            setVerifyingOtp(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Payment Configuration (UPI) */}
            <div className="bg-white rounded-[32px] p-8 border border-amber-100 shadow-xl shadow-amber-900/5 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-6 opacity-5"><FaUniversity size={80} className="text-amber-800" /></div>
                <div className="flex items-center gap-3 mb-6 text-amber-800 relative z-10">
                    <FaUniversity size={20} />
                    <h3 className="text-xl font-bold">Payment Configuration</h3>
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
                        <div>
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Current UPI ID</p>
                            <p className="text-lg font-black text-gray-800 font-mono">{upiId || 'Not Configured'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUpiDialog(true)}
                            className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-amber-700 transition-colors"
                        >
                            Change UPI ID
                        </button>
                    </div>
                    <p className="text-[10px] text-amber-600/70 font-medium italic">* Changing the UPI ID requires OTP verification sent to the admin email.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-teal-800">Payment Reviews</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowOfflineModal(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal-700 transition-all shadow-md flex items-center gap-2"
                    >
                        <FaMoneyBillWave /> Record Cash
                    </button>
                    <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-teal-100">
                        {['pending', 'approved', 'rejected', 'all'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading payments...</div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-teal-50 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="bg-teal-50/50 border-b border-teal-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-teal-800 uppercase tracking-widest whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-teal-800 uppercase tracking-widest whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-teal-800 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-teal-800 uppercase tracking-widest whitespace-nowrap">Proof</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-teal-800 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No payments found</td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                                <div className="text-[10px] font-medium text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-800">{payment.customer?.name || 'Unknown'}</div>
                                                <div className="text-xs text-teal-600 font-medium">{payment.customer?.username}</div>
                                                <div className="text-[10px] text-gray-400">{payment.customer?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-lg font-black ${payment.status === 'approved' ? 'text-green-600' : 'text-teal-700'}`}>
                                                    ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                {payment.transactionId && <div className="text-[10px] bg-gray-100 inline-block px-1.5 py-0.5 rounded text-gray-500 font-mono mt-1">{payment.transactionId}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {payment.proofUrl === 'offline_payment' || payment.paymentMethod === 'CASH' ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200">
                                                        <FaMoneyBillWave size={12} /> Cash Payment
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => openProof(payment)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <FaExternalLinkAlt size={10} /> View Proof
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border w-fit ${payment.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        payment.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                    {payment.status === 'rejected' && (
                                                        <span className="text-[8px] text-red-400 font-bold max-w-[120px] truncate" title={payment.adminComment || payment.rejectionReason}>
                                                            {payment.adminComment || payment.rejectionReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                {payment.status === 'pending' ? (
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => openApprove(payment)}
                                                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm hover:shadow-green-200 group/approve hover:scale-105 active:scale-95"
                                                            title="Approve Payment"
                                                        >
                                                            <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-inner group-hover/approve:bg-green-500 group-hover/approve:text-white transition-colors">
                                                                <FaCheck size={10} className="group-hover/approve:animate-pulse" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => openReject(payment)}
                                                            className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-200 group/reject hover:scale-105 active:scale-95 hover:animate-shake"
                                                            title="Reject Payment"
                                                        >
                                                            <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-inner group-hover/reject:bg-red-500 group-hover/reject:text-white transition-colors">
                                                                <FaTimes size={10} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Reject</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No Actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approve Dialog */}
            {showApproveDialog && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 space-y-6">
                        <div className="flex items-center gap-4 text-amber-600">
                            <div className="p-3 bg-amber-50 rounded-2xl">
                                <FaExclamationTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Confirm Approval</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            Are you sure you want to approve this payment of <strong className="text-teal-700">₹{selectedPayment.amount.toLocaleString()}</strong>?
                        </p>
                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                            <div className="shrink-0 mt-1 h-2 w-2 rounded-full bg-amber-500"></div>
                            <p className="text-xs text-amber-700 font-bold leading-relaxed">This will permanently reduce the customer's Due Amount.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveDialog(false)}
                                className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="flex-2 py-4 bg-teal-600 text-white text-sm font-black rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all active:scale-95"
                            >
                                {actionLoading ? 'Approving...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {showRejectDialog && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 space-y-6">
                        <div className="flex items-center gap-4 text-red-600">
                            <div className="p-3 bg-red-50 rounded-2xl">
                                <FaTimes size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Reject Payment</h3>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Transaction ID invalid, blurred image..."
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm h-32 font-medium"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectReason}
                                className="flex-1 py-4 bg-red-500 text-white text-sm font-black rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Modal */}
            {showProofModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowProofModal(false)}>
                    <div className="relative max-w-3xl w-full max-h-[90vh] bg-transparent rounded-3xl overflow-hidden flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedPayment.proofUrl}
                            alt="Payment Proof"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
                        />
                        <button
                            onClick={() => setShowProofModal(false)}
                            className="absolute -top-4 -right-4 h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-2xl hover:scale-110 transition-transform z-10"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Offline Payment Modal */}
            {showOfflineModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 space-y-8 border border-white/20">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                    <FaMoneyBillWave size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 font-serif tracking-tight">Record Cash</h3>
                            </div>
                            <button onClick={() => setShowOfflineModal(false)} className="h-10 w-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Customer</label>
                                <select
                                    value={offlineForm.customerId}
                                    onChange={(e) => setOfflineForm({ ...offlineForm, customerId: e.target.value, amount: '' })}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 font-bold text-gray-700 appearance-none"
                                >
                                    <option value="">Start typing name...</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.name} ({c.phone})
                                        </option>
                                    ))}
                                </select>
                                {offlineForm.customerId && (
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Balance</span>
                                        <span className="text-xs font-black text-teal-600">₹{selectedCustDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount Received (₹)</label>
                                <input
                                    type="number"
                                    value={offlineForm.amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className={`w-full p-5 bg-gray-50 rounded-[24px] border-2 ${Number(offlineForm.amount) >= selectedCustDue && selectedCustDue > 0 ? 'border-amber-300' : 'border-gray-100'} focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 font-black text-3xl text-teal-700 tracking-tighter`}
                                />
                                {offlineForm.customerId && Number(offlineForm.amount) >= selectedCustDue && selectedCustDue > 0 && (
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <FaExclamationTriangle size={10} /> Auto-capped to maximum due balance
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Note</p>
                                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                    Recording this cash payment will <span className="text-teal-600 font-bold">immediately</span> deduct the amount from the customer's due balance.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={offlineLoading || !offlineForm.customerId || !offlineForm.amount || Number(offlineForm.amount) <= 0}
                                className="w-full py-5 bg-teal-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                Proceed to Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Cash Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in zoom-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full p-8 space-y-6 border border-white/20">
                        <div className="h-20 w-20 bg-green-50 rounded-[28px] flex items-center justify-center text-green-600 mx-auto">
                            <FaMoneyBillWave size={36} />
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Confirm Cash</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
                                Are you sure you want to record a cash payment of <span className="text-green-600 font-black">₹{Number(offlineForm.amount).toLocaleString()}</span>?
                            </p>
                        </div>
                        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                            <p className="text-[10px] text-teal-700 font-black uppercase tracking-widest text-center mb-1">Impact</p>
                            <p className="text-[11px] text-teal-600 font-bold text-center">Customer's due amount will be reduced immediately.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                Wait, No
                            </button>
                            <button
                                onClick={handleOfflineSubmit}
                                disabled={offlineLoading}
                                className="flex-2 py-4 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {offlineLoading ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* UPI Update Dialog */}
            {showUpiDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 space-y-6">
                        <div className="flex items-center gap-4 text-amber-600">
                            <div className="p-3 bg-amber-50 rounded-2xl">
                                <FaUniversity size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Update UPI ID</h3>
                        </div>

                        {!otpSent ? (
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                    To change the UPI ID, we need to verify your identity. Click below to receive an OTP on your admin email.
                                </p>
                                <button
                                    onClick={handleUpiRequest}
                                    disabled={sendingOtp}
                                    className="w-full py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all active:scale-95"
                                >
                                    {sendingOtp ? 'Sending OTP...' : 'Send OTP verification'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New UPI ID</label>
                                    <input
                                        type="text"
                                        value={newUpiId}
                                        onChange={e => setNewUpiId(e.target.value)}
                                        placeholder="username@upi"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-gray-700 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-5 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-black letter-spacing-4 text-center text-3xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-amber-700 tracking-widest"
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    onClick={handleUpiVerify}
                                    disabled={verifyingOtp || !otp || !newUpiId}
                                    className="w-full py-5 bg-green-600 text-white font-black rounded-3xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all active:scale-95"
                                >
                                    {verifyingOtp ? 'Verifying...' : 'Verify & Update'}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setShowUpiDialog(false); setOtpSent(false); }}
                            className="w-full py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
