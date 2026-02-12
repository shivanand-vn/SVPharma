import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
    FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle, FaTruck,
    FaRupeeSign, FaCalendarAlt, FaHistory, FaArrowLeft,
    FaArrowRight, FaExclamationTriangle, FaUndo
} from 'react-icons/fa';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'delivered': return 'bg-teal-50 text-teal-600 border-teal-100';
            case 'cancelled': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <FaClock />;
            case 'processing': return <FaTruck />;
            case 'delivered': return <FaCheckCircle />;
            case 'cancelled': return <FaTimesCircle />;
            default: return <FaShoppingBag />;
        }
    };


    return (
        <div className="p-8 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                        <div className="h-12 w-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-100">
                            <FaHistory />
                        </div>
                        My Purchase History
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-16">
                        Review your purchase history and manage medical invoices
                    </p>
                </div>
                <Link to="/customer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:text-[#115e59] transition-colors py-3 px-6 bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all w-fit ml-16 md:ml-0">
                    <FaArrowLeft /> Back to Shopping
                </Link>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 border-4 border-gray-200 border-t-teal-500 animate-spin" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Retrieving your medical records...</p>
                </div>
            ) : orders.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {orders.map((order: any) => (
                        <div key={order._id} className="bg-white rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all p-8 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-teal-100/50 transition-colors" />

                            <div className="flex flex-col gap-8 relative z-10">
                                {/* Top Bar */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-gray-300 font-black uppercase tracking-widest">Order Reference</p>
                                        <h3 className="text-lg font-black text-gray-800">#{order._id.slice(-8).toUpperCase()}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {order.returns?.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-amber-50">
                                                <FaUndo size={8} /> Returned
                                            </div>
                                        )}
                                        <div className={`px-5 py-2 rounded-2xl border text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(order.status)} shadow-sm`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ordered On</p>
                                        <p className="text-sm font-black text-gray-700 flex items-center gap-2">
                                            <FaCalendarAlt className="text-teal-500" />
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                                        <div className="flex flex-col">
                                            {order.isAdminModified && (
                                                <p className="text-[10px] font-bold text-gray-400 line-through flex items-center gap-0.5">
                                                    <FaRupeeSign size={8} />
                                                    {order.originalTotalPrice.toFixed(2)}
                                                </p>
                                            )}
                                            <p className="text-sm font-black text-primary flex items-center gap-1">
                                                <FaRupeeSign className="text-primary" />
                                                {order.totalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Included Medications ({order.items.length})</p>
                                    <div className="max-h-80 overflow-y-auto no-scrollbar space-y-2 pr-2">
                                        {order.items.map((item: any, idx: number) => {
                                            const originalItem = order.isAdminModified ? order.originalItems?.find((oi: any) => (oi.medicine?.toString() === item.medicine?.toString()) || oi.name === item.name) : null;
                                            const isAdjusted = originalItem && originalItem.quantity !== item.quantity;

                                            return (
                                                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl bg-white border transition-all ${isAdjusted ? 'border-amber-100 bg-amber-50/20' : 'border-gray-50'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs p-2 ${isAdjusted ? 'bg-amber-100 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
                                                            {item.quantity}x
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{item.name}</p>
                                                                {isAdjusted && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Adjusted</span>}
                                                                {(() => {
                                                                    const returnedQty = order.returns?.filter((r: any) => r.name === item.name).reduce((acc: number, r: any) => acc + r.quantity, 0) || 0;
                                                                    return returnedQty > 0 && (
                                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${returnedQty === item.quantity ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                            {returnedQty === item.quantity ? 'Returned' : 'Partially Returned'}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            {(() => {
                                                                const returnedQty = order.returns?.filter((r: any) => r.name === item.name).reduce((acc: number, r: any) => acc + r.quantity, 0) || 0;
                                                                return isAdjusted ? (
                                                                    <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                        Original: {originalItem.quantity} <FaArrowRight size={8} /> {item.quantity}
                                                                    </p>
                                                                ) : returnedQty > 0 ? (
                                                                    <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                        Items Returned: {returnedQty}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-[10px] text-gray-400 font-bold">Standard Formula</p>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-gray-800">₹{item.price.toFixed(2)}</p>
                                                        {isAdjusted && <p className="text-[8px] text-gray-400 font-bold uppercase">Updated rate</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Show Removed Items */}
                                        {order.isAdminModified && order.originalItems?.filter((oi: any) => !order.items.some((ni: any) => (ni.medicine?.toString() === oi.medicine?.toString()) || ni.name === oi.name)).map((removedItem: any, idx: number) => (
                                            <div key={`removed-${idx}`} className="flex items-center justify-between p-4 rounded-2xl bg-red-50/30 border border-red-50 opacity-60">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center text-red-400 font-bold text-xs p-2 strike-through">
                                                        {removedItem.quantity}x
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-red-800/50 uppercase tracking-tight line-through">{removedItem.name}</p>
                                                            <span className="text-[8px] font-black bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase">Removed</span>
                                                        </div>
                                                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5">Removed by Admin</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-black text-red-800/30 line-through">₹{removedItem.price.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {order.isAdminModified && (
                                    <div className="mt-4 p-5 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                                        <div className="h-10 w-10 bg-amber-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-200">
                                            <FaExclamationTriangle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-amber-700 uppercase tracking-tight">Admin Modified Order</p>
                                            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">
                                                The payable amount was {order.totalPrice > order.originalTotalPrice ? 'increased' : 'reduced'} by ₹{Math.abs(order.originalTotalPrice - order.totalPrice).toFixed(2)}. Original total was ₹{order.originalTotalPrice.toFixed(2)} and the new total is ₹{order.totalPrice.toFixed(2)}.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-32 bg-white rounded-[64px] border-2 border-dashed border-gray-100 text-center">
                    <div className="h-32 w-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                        <FaShoppingBag size={50} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">No Transactions Yet</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Start your shopping journey with us</p>
                    <button className="mt-10 px-10 py-5 bg-teal-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all hover:px-12">
                        Browse Medicines
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
