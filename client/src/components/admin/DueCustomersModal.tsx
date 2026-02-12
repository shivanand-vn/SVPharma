import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaMoneyBillWave, FaSortAmountDown, FaSortAmountUp, FaUser } from 'react-icons/fa';

interface DueCustomersModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: any[];
    onRecordPayment: (customer: any) => void;
}

const DueCustomersModal: React.FC<DueCustomersModalProps> = ({ isOpen, onClose, customers, onRecordPayment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);

    useEffect(() => {
        if (customers) {
            // Filter only customers with due > 0
            let result = customers.filter((c: any) => c.dueAmount > 0 || c.pendingBalance > 0);

            // Search filter
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                result = result.filter((c: any) =>
                    c.name.toLowerCase().includes(lowerTerm) ||
                    c.phone.includes(searchTerm) ||
                    (c.shopName && c.shopName.toLowerCase().includes(lowerTerm))
                );
            }

            // Sort
            result.sort((a: any, b: any) => {
                const dueA = a.dueAmount || a.pendingBalance || 0;
                const dueB = b.dueAmount || b.pendingBalance || 0;
                return sortOrder === 'desc' ? dueB - dueA : dueA - dueB;
            });

            setFilteredCustomers(result);
        }
    }, [customers, searchTerm, sortOrder, isOpen]);

    if (!isOpen) return null;

    const totalDueInList = filteredCustomers.reduce((acc, c) => acc + (c.dueAmount || c.pendingBalance || 0), 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white/20">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <FaMoneyBillWave size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Outstanding Dues</h2>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">
                                Total: ₹{totalDueInList.toFixed(2)} • {filteredCustomers.length} Customers
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                    >
                        <FaTimes />
                    </button>
                    <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                </div>

                {/* Filters */}
                <div className="p-4 bg-teal-50 border-b border-teal-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none font-bold text-gray-700 placeholder:text-gray-400 text-sm bg-white"
                        />
                    </div>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-teal-200 text-teal-700 font-bold text-sm hover:bg-teal-50 transition-colors w-full md:w-auto justify-center"
                    >
                        {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                        Sort by Amount
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50">
                    {filteredCustomers.length > 0 ? (
                        <div className="space-y-3">
                            {filteredCustomers.map((customer) => {
                                const due = customer.dueAmount || customer.pendingBalance || 0;
                                return (
                                    <div key={customer._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100 shrink-0">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{customer.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                    <span>{customer.phone}</span>
                                                    {customer.shopName && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{customer.shopName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Amount</p>
                                                <p className="text-lg font-black text-red-600 tracking-tighter">₹{due.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => onRecordPayment(customer)}
                                                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 transform active:scale-95"
                                            >
                                                Record Pay
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                            <FaUser className="text-4xl text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold">No customers found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DueCustomersModal;
