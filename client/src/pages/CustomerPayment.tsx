import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaRupeeSign, FaUpload, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface Payment {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    rejectionReason?: string;
    createdAt: string;
    transactionId?: string;
    paymentMethod?: string;
    proofUrl?: string;
}

const CustomerPayment = () => {
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [amount, setAmount] = useState<string>('');
    const [transactionId, setTransactionId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dueAmount, setDueAmount] = useState(0);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [adminUpi, setAdminUpi] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [reuploadFiles, setReuploadFiles] = useState<{ [key: string]: File }>({});
    const [reuploadPreviews, setReuploadPreviews] = useState<{ [key: string]: string }>({});
    const reuploadInputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

    // Final due amount priority
    const displayDue = user?.dueAmount !== undefined ? user.dueAmount : dueAmount;

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, paymentsRes, settingsRes] = await Promise.all([
                    api.get('/payments/wallet'),
                    api.get('/payments/my'),
                    api.get('/settings')
                ]);

                setDueAmount(walletRes.data.pendingBalance || 0);
                setPayments(paymentsRes.data);
                setAdminUpi(settingsRes.data.upiId || 'admin@upi');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleReuploadFileChange = (paymentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setReuploadFiles(prev => ({ ...prev, [paymentId]: selectedFile }));
            setReuploadPreviews(prev => ({ ...prev, [paymentId]: URL.createObjectURL(selectedFile) }));
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) {
            if (Number(val) > displayDue) {
                showNotification(`Amount cannot exceed total due (₹${displayDue})`, 'warning');
            } else {
                setAmount(val);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0 || !file) {
            showNotification('Please fill all fields and upload payment proof', 'warning');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                }
            });

            const proofUrl = uploadRes.data.url;

            await api.post('/payments', {
                amount: Number(amount),
                transactionId,
                proofUrl
            });

            setAmount('');
            setTransactionId('');
            setFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadProgress(0);

            const res = await api.get('/payments/my');
            setPayments(res.data);

            showNotification('Payment submitted successfully! Waiting for admin verification.', 'success');
        } catch (error: any) {
            console.error('Payment submission failed:', error);
            showNotification(error.response?.data?.message || 'Failed to submit payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReupload = async (paymentId: string) => {
        const reuploadFile = reuploadFiles[paymentId];
        if (!reuploadFile) {
            showNotification('Please select a new proof image first', 'warning');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', reuploadFile);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const proofUrl = uploadRes.data.url;

            await api.put(`/payments/${paymentId}/reupload`, { proofUrl });

            // Clear item-specific reupload state
            setReuploadFiles(prev => {
                const newState = { ...prev };
                delete newState[paymentId];
                return newState;
            });
            setReuploadPreviews(prev => {
                const newState = { ...prev };
                delete newState[paymentId];
                return newState;
            });

            const res = await api.get('/payments/my');
            setPayments(res.data);
            showNotification('New payment proof uploaded successfully. Awaiting admin verification.', 'success');
        } catch (error: any) {
            console.error('Re-upload failed:', error);
            showNotification(error.response?.data?.message || 'Failed to re-upload proof', 'error');
        } finally {
            setLoading(false);
        }
    };

    const upiLink = `upi://pay?pa=${adminUpi}&pn=SVPharma&am=${amount || '0'}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <FaCheckCircle />;
            case 'rejected': return <FaTimesCircle />;
            default: return <FaClock />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
            <Link
                to="/customer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-teal-50 hover:bg-teal-50 transition-all hover:scale-105 active:scale-95 group w-fit"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            {/* Header / Due Amount Card */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 group-hover:rotate-12 transition-transform duration-700">
                    <FaRupeeSign size={120} />
                </div>
                <div className="relative z-10">
                    <p className="text-teal-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Total Outstanding Due</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black opacity-60">₹</span>
                        <span className="text-6xl md:text-7xl font-black tracking-tighter">{displayDue.toFixed(2)}</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-teal-100/60 uppercase tracking-widest bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                        Last Updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3 font-serif">
                            <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                                <FaRupeeSign size={16} />
                            </div>
                            Submit Payment Proof
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Payment Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-600 font-black text-xl group-focus-within:scale-110 transition-transform">₹</span>
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none text-xl font-black text-gray-800 transition-all font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {Number(amount) > 0 && (
                                <div className="flex flex-col items-center p-6 bg-teal-50/30 rounded-3xl border-2 border-teal-100 border-dashed animate-in fade-in zoom-in-95 duration-300">
                                    <img src={qrCodeUrl} alt="Payment QR" className="w-48 h-48 rounded-2xl mix-blend-multiply shadow-inner p-2 bg-white" />
                                    <div className="text-center mt-4">
                                        <p className="text-[10px] font-black text-teal-800 uppercase tracking-[0.2em] mb-1">Scan & Pay via UPI</p>
                                        <p className="text-[11px] font-black text-teal-600 font-mono bg-white px-3 py-1 rounded-lg border border-teal-100">{adminUpi}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Transaction Link (ID)</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter UPI Reference ID"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none font-bold text-sm transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Upload Receipt</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                    id="proof-upload"
                                />
                                <label
                                    htmlFor="proof-upload"
                                    className={`w-full flex flex-col items-center justify-center p-8 border-[3px] border-dashed rounded-3xl cursor-pointer transition-all ${file ? 'border-teal-500 bg-teal-50 shadow-xl shadow-teal-900/5 translate-y-[-2px]' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-200'}`}
                                >
                                    {previewUrl ? (
                                        <div className="relative group/preview">
                                            <img src={previewUrl} alt="Preview" className="h-40 object-contain rounded-2xl shadow-xl transition-transform group-hover/preview:scale-105" />
                                            <div className="absolute inset-0 bg-teal-900/20 opacity-0 group-hover/preview:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
                                                <FaUpload className="text-white text-2xl" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-sm border border-teal-50 mb-4 group-hover:scale-110 transition-transform">
                                                <FaUpload size={20} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap to upload proof</p>
                                            <p className="text-[8px] font-bold text-gray-300 uppercase mt-2">JPG, PNG, PDF up to 5MB</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] font-black shadow-xl shadow-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm uppercase tracking-widest"
                            >
                                {loading ? `Processing ${uploadProgress}%...` : 'Submit Verification Request'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center justify-between font-serif">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                                    <FaHistory size={16} />
                                </div>
                                Payment History
                            </div>
                            <span className="text-[9px] bg-teal-50 text-teal-600 px-3 py-1 rounded-lg uppercase tracking-widest font-black">{payments.length} Records</span>
                        </h2>

                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {payments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No history found</p>
                                </div>
                            ) : (
                                payments.map((payment) => (
                                    <div key={payment._id} className="p-5 rounded-3xl bg-white border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all group/item">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xl font-black text-gray-800 tracking-tight">₹{payment.amount.toFixed(2)}</span>
                                                    {payment.paymentMethod === 'CASH' && (
                                                        <span className="text-[7px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-black uppercase tracking-wider border border-amber-100">Offline</span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-2xl text-[9px] font-black flex items-center gap-2 border uppercase tracking-widest shadow-sm ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50/50">
                                            {payment.transactionId ? (
                                                <p className="text-[10px] text-gray-400 font-mono font-bold">Ref: {payment.transactionId}</p>
                                            ) : (
                                                <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">ID: #{payment._id.slice(-6).toUpperCase()}</p>
                                            )}

                                            <div className="flex items-center gap-2">
                                                {payment.paymentMethod === 'CASH' ? (
                                                    <span className="text-[8px] text-gray-400 italic font-medium px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">Cash Payment — Recorded by Admin</span>
                                                ) : payment.proofUrl ? (
                                                    <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-teal-600 hover:text-teal-700 underline underline-offset-4 decoration-2 decoration-teal-100 transition-colors">View Proof</a>
                                                ) : null}
                                            </div>
                                        </div>

                                        {payment.status === 'rejected' && (
                                            <div className="mt-2 pt-4 border-t-2 border-dashed border-red-50 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
                                                    <p className="text-[9px] font-black text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <FaTimesCircle className="text-red-500" /> Rejection Reason
                                                    </p>
                                                    <p className="text-xs text-red-600 font-medium leading-relaxed">{payment.rejectionReason || 'Proof was not clear or transaction not found.'}</p>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest ml-1">Action Required: Re-submit Proof</p>

                                                    {reuploadPreviews[payment._id] ? (
                                                        <div className="relative group/repreview rounded-2xl overflow-hidden border-2 border-teal-500 shadow-lg animate-in zoom-in-95 duration-200">
                                                            <img src={reuploadPreviews[payment._id]} alt="New Proof Preview" className="h-40 w-full object-contain bg-teal-50" />
                                                            <div className="absolute inset-0 bg-teal-900/40 opacity-0 group-hover/repreview:opacity-100 flex items-center justify-center transition-opacity gap-3">
                                                                <button
                                                                    onClick={() => reuploadInputRefs.current[payment._id]?.click()}
                                                                    className="p-3 bg-white text-teal-600 rounded-xl shadow-xl hover:scale-110 transition-transform"
                                                                    title="Change Image"
                                                                >
                                                                    <FaUpload size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setReuploadFiles(prev => {
                                                                            const newState = { ...prev };
                                                                            delete newState[payment._id];
                                                                            return newState;
                                                                        });
                                                                        setReuploadPreviews(prev => {
                                                                            const newState = { ...prev };
                                                                            delete newState[payment._id];
                                                                            return newState;
                                                                        });
                                                                    }}
                                                                    className="p-3 bg-white text-red-500 rounded-xl shadow-xl hover:scale-110 transition-transform"
                                                                    title="Clear Selection"
                                                                >
                                                                    <FaTrash size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => reuploadInputRefs.current[payment._id]?.click()}
                                                            disabled={loading}
                                                            className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group/picker"
                                                        >
                                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-teal-500 shadow-sm border border-teal-50 group-hover/picker:scale-110 transition-transform">
                                                                <FaUpload size={14} />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    ref={el => { if (el) reuploadInputRefs.current[payment._id] = el; }}
                                                                    onChange={(e) => handleReuploadFileChange(payment._id, e)}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select New Proof Image</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleReupload(payment._id)}
                                                        disabled={loading || !reuploadFiles[payment._id]}
                                                        className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle size={12} />}
                                                        {loading ? 'UPLOADING...' : 'Confirm & Upload Proof'}
                                                    </button>

                                                    <p className="text-[8px] text-gray-400 text-center font-bold px-4">* Upload a clear screenshot showing transaction ID and amount.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPayment;
