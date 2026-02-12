import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    FaCheck,
    FaTimes,
    //FaExternalLinkAlt,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaUniversity,
    // FaDownload,
    FaEye,
    FaCalendarAlt,
    FaUser,
    FaFileInvoiceDollar,
    FaArrowRight,
    FaRegClock
} from 'react-icons/fa';
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
    rejectionReason?: string;

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
                <div className="bg-white rounded-[32px] shadow-sm border border-teal-50 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Customer Details</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Proof of Payment</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-6 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <FaRegClock size={48} className="opacity-20" />
                                                <p className="text-sm font-bold">No payment records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="group hover:bg-teal-50/30 transition-all duration-300">
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                                                        <FaCalendarAlt size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-700">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-black text-xs">
                                                        {payment.customer?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-800 tracking-tight">{payment.customer?.name || 'Unknown'}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">{payment.customer?.username}</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{payment.customer?.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className={`text-lg font-black tracking-tighter ${payment.status === 'approved' ? 'text-green-600' : 'text-slate-900'}`}>
                                                        ₹{payment.amount.toFixed(2)}
                                                    </span>
                                                    {payment.transactionId && (
                                                        <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit mt-1">
                                                            ID: {payment.transactionId}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                {payment.proofUrl === 'offline_payment' || payment.paymentMethod === 'CASH' ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                        <FaMoneyBillWave size={12} /> Cash Payment
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => openProof(payment)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all group/proof shadow-sm hover:shadow-indigo-200"
                                                    >
                                                        <FaEye size={12} className="group-hover/proof:scale-110 transition-transform" />
                                                        Verify Proof
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${payment.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200 shadow-sm shadow-green-100' :
                                                        payment.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 shadow-sm shadow-red-100' :
                                                            'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                    {payment.status === 'rejected' && (
                                                        <p className="text-[10px] text-red-400 font-bold max-w-[150px] truncate italic" title={payment.adminComment || payment.rejectionReason}>
                                                            "{payment.adminComment || payment.rejectionReason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right whitespace-nowrap">
                                                {payment.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                        <button
                                                            onClick={() => openApprove(payment)}
                                                            className="h-10 w-10 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95"
                                                            title="Approve"
                                                        >
                                                            <FaCheck size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => openReject(payment)}
                                                            className="h-10 w-10 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
                                                            title="Reject"
                                                        >
                                                            <FaTimes size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 border border-slate-100">
                                                        <FaCheck size={12} className="opacity-50" />
                                                    </div>
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

            {/* Premium Approve Dialog */}
            {showApproveDialog && selectedPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
                        {/* Header with Background Gradient */}
                        <div className="bg-gradient-to-br from-green-500 to-teal-600 p-8 text-center relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] opacity-40"></div>
                            <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl border border-white/30">
                                <FaCheck size={32} className="animate-bounce-short" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Approve Payment</h3>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <span>Payment Summary</span>
                                    <FaFileInvoiceDollar size={14} className="text-slate-300" />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-500">{selectedPayment.customer?.name}</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{selectedPayment.amount.toFixed(2)}</p>
                                    </div>
                                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                        <FaMoneyBillWave size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-inner">
                                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                    <FaExclamationTriangle size={16} />
                                </div>
                                <p className="text-[11px] text-amber-800 font-black leading-relaxed">
                                    CONFIRMATION: This action will permanently credit the amount and reduce the customer's due balance.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowApproveDialog(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex-[1.5] py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-teal-600 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Confirm Approval <FaArrowRight size={10} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Reject Dialog */}
            {showRejectDialog && selectedPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
                        {/* Header with Background Gradient */}
                        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 text-center relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] opacity-40"></div>
                            <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl border border-white/30">
                                <FaTimes size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Reject Payment</h3>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Rejection</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g., Transaction ID invalid, blurred image..."
                                    className="w-full p-5 bg-slate-50 rounded-[24px] border border-slate-100 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm h-32 font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                                />
                            </div>

                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed text-center px-4">
                                Note: Recording a rejection will notify the customer via email with the provided reason.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowRejectDialog(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectReason}
                                    className="flex-[1.5] py-4 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-xl shadow-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Confirm Rejection</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Side-by-Side Proof Modal */}
            {showProofModal && selectedPayment && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-50 w-full max-w-5xl rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-3xl">
                        {/* Image Side */}
                        <div className="flex-[1.5] bg-slate-950 flex flex-col relative group">
                            <div className="absolute top-6 left-6 z-10">
                                <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    Payment Proof
                                </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
                                <img
                                    src={selectedPayment.proofUrl}
                                    alt="Payment Proof"
                                    className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                                />
                            </div>
                            {/* Toolbar */}
                            <div className="p-6 bg-slate-900/50 backdrop-blur-md flex justify-center gap-4 border-t border-white/5">
                                {/* Download Original button removed as per request */}
                            </div>
                        </div>

                        {/* Details Side */}
                        <div className="flex-1 p-8 lg:p-12 space-y-8 flex flex-col bg-white">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Verification</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Double check details below</p>
                                </div>
                                <button
                                    onClick={() => setShowProofModal(false)}
                                    className="h-12 w-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-all active:scale-95"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                {/* Detail Rows */}
                                <div className="grid gap-4">
                                    {[
                                        { icon: <FaUser />, label: "Customer", value: selectedPayment.customer?.name },
                                        { icon: <FaMoneyBillWave />, label: "Paid Amount", value: `₹${selectedPayment.amount.toFixed(2)}`, highlight: true },
                                        { icon: <FaFileInvoiceDollar />, label: "Transaction ID", value: selectedPayment.transactionId || "N/A", mono: true },
                                        { icon: <FaCalendarAlt />, label: "Date & Time", value: `${new Date(selectedPayment.createdAt).toLocaleDateString()} ${new Date(selectedPayment.createdAt).toLocaleTimeString()}` }
                                    ].map((detail, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-teal-600 transition-colors shadow-sm">
                                                {detail.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail.label}</p>
                                                <p className={`text-sm font-black ${detail.highlight ? 'text-teal-600' : 'text-slate-800'} ${detail.mono ? 'font-mono' : ''}`}>
                                                    {detail.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Direct Actions in Modal */}
                            {selectedPayment.status === 'pending' && (
                                <div className="space-y-4 pt-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { setShowProofModal(false); openReject(selectedPayment); }}
                                            className="flex-1 py-4 border-2 border-red-500 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => { setShowProofModal(false); openApprove(selectedPayment); }}
                                            className="flex-[2] py-4 bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            Approve Payment <FaArrowRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
                                        <span className="text-xs font-black text-teal-600">₹{selectedCustDue.toFixed(2)}</span>
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
                                    className={`w-full p-5 bg-gray-50 rounded-[24px] border-2 ${Number(offlineForm.amount) >= selectedCustDue && selectedCustDue > 0 ? 'border-amber-300' : 'border-gray-100'} focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 font-black text-3xl text-teal-700 tracking-tighter no-spinner`}
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
                                Are you sure you want to record a cash payment of <span className="text-green-600 font-black">₹{Number(offlineForm.amount).toFixed(2)}</span>?
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
