import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../utils/api';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
    onSuccess: () => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, customer, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer || !amount) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/payments/offline', {
                customerId: customer._id,
                amount: Number(amount)
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Payment record failed', err);
            setError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !customer) return null;

    const currentDue = customer.dueAmount || customer.pendingBalance || 0;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 bg-teal-700 text-white flex justify-between items-center">
                    <h3 className="text-xl font-black">Record Payment</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-teal-600 font-bold shadow-sm">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</p>
                            <p className="font-bold text-teal-900">{customer.name}</p>
                            <p className="text-xs font-medium text-gray-500">Current Due: <span className="text-red-600 font-bold">₹{currentDue}</span></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payment Amount (₹)</label>
                            <div className="relative">
                                <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-gray-700 text-lg transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0.00"
                                    max={currentDue}
                                    min={1}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                            <div className="mt-0.5 text-amber-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                <span className="font-bold block uppercase tracking-wider mb-0.5">Warning</span>
                                This action cannot be undone. Please verify the amount and customer before proceeding.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="flex-[2] py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FaCheckCircle /> Confirm Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
