import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    FaSearch, FaFilter, FaShoppingBag, FaClock, FaCheckCircle,
    FaTimesCircle, FaTruck, FaRupeeSign, FaUser, FaCalendarAlt,
    FaFileInvoice, FaTimes, FaCamera,
    FaAt, FaMobileAlt, FaMinus, FaPlus, FaTrashAlt, FaExclamationTriangle,
    FaArrowRight, FaUndo, FaMapMarkerAlt
} from 'react-icons/fa';
import { formatAddress } from '../../utils/addressHelper';

// --- Skeleton Components ---
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-6 w-10" />
        </div>
    </div>
);

const OrderCardSkeleton = () => (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-14 w-32 rounded-2xl flex-shrink-0" />
            ))}
        </div>
    </div>
);

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal States
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
    const [cancellationModal, setCancellationModal] = useState(false);
    const [deliveryModal, setDeliveryModal] = useState(false);
    const [invoiceModal, setInvoiceModal] = useState(false);
    const [processingConfirmModal, setProcessingConfirmModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [modalStatus, setModalStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [editedItems, setEditedItems] = useState<any[]>([]);
    const [returnModal, setReturnModal] = useState(false);
    const [returnItems, setReturnItems] = useState<any[]>([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnSuccess, setReturnSuccess] = useState(false);
    const [returnProcessing, setReturnProcessing] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
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

    const handleReturnItems = async (orderId: string, returnedItems: any[]) => {
        try {
            setReturnProcessing(true);
            await api.post(`/orders/${orderId}/return`, {
                returnedItems: returnedItems.map(i => ({ ...i, reason: returnReason }))
            });
            setReturnSuccess(true);
            fetchOrders();
        } catch (error: any) {
            console.error('Error processing return:', error);
            alert(error.response?.data?.message || 'Failed to process return');
        } finally {
            setReturnProcessing(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string, additionalData: any = {}) => {
        try {
            setUpdating(true);
            if (status === 'delivered') setModalStatus('uploading');

            const formData = new FormData();
            formData.append('status', status);

            if (status === 'cancelled') {
                formData.append('cancellationReason', additionalData.reason);
            }
            if (status === 'delivered') {
                formData.append('deliverySlip', additionalData.file);
            }
            if (status === 'processing' && additionalData.modifiedItems) {
                formData.append('modifiedItems', JSON.stringify(additionalData.modifiedItems));
            }

            await api.put(`/orders/${orderId}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (status === 'delivered') {
                setModalStatus('success');
                setStatusMessage('Delivery proof uploaded successfully');
                setTimeout(() => {
                    setDeliveryModal(false);
                    setModalStatus('idle');
                    setDeliveryFile(null);
                    fetchOrders();
                }, 2000);
            } else {
                fetchOrders();
                setCancellationModal(false);
                setProcessingConfirmModal(false);
                setCancellationReason('');
            }
        } catch (error: any) {
            console.error('Error updating status:', error);
            const msg = error.response?.data?.message || 'Failed to update status. Please try again.';
            if (status === 'delivered') {
                setModalStatus('error');
                setStatusMessage(msg);
            } else {
                alert(msg);
            }
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <FaShoppingBag />
                        </div>
                        Order Management
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-16">
                        Monitor and process incoming medical orders
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by customer or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-64 focus:w-80 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm font-bold text-sm"
                        />
                    </div>
                    <div className="h-14 w-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary cursor-pointer transition-all hover:shadow-lg">
                        <FaFilter />
                    </div>
                </div>
            </div>

            {/* Dashboard Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                {loading ? (
                    Array(6).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    [
                        { id: 'all', label: 'Total Orders', value: orders.length, icon: <FaShoppingBag />, color: 'primary' },
                        { id: 'pending', label: 'Pending', value: orders.filter((o: any) => o.status === 'pending').length, icon: <FaClock />, color: 'amber-500' },
                        { id: 'processing', label: 'Processing', value: orders.filter((o: any) => o.status === 'processing').length, icon: <FaTruck />, color: 'blue-500' },
                        { id: 'shipped', label: 'Shipped', value: orders.filter((o: any) => o.status === 'shipped').length, icon: <FaTruck />, color: 'purple-500' },
                        { id: 'delivered', label: 'Completed', value: orders.filter((o: any) => o.status === 'delivered').length, icon: <FaCheckCircle />, color: 'teal-500' },
                        { id: 'cancelled', label: 'Cancelled', value: orders.filter((o: any) => o.status === 'cancelled').length, icon: <FaTimesCircle />, color: 'red-500' },
                    ].map((stat) => (
                        <button
                            key={stat.id}
                            onClick={() => setStatusFilter(stat.id)}
                            className={`bg-white p-6 rounded-[32px] border-2 text-left transition-all group ${statusFilter === stat.id
                                ? `border-${stat.color === 'primary' ? 'primary' : stat.color} shadow-xl shadow-blue-900/10 scale-[1.02]`
                                : 'border-gray-50 shadow-sm hover:border-gray-200'
                                }`}
                        >
                            <div className={`h-12 w-12 rounded-xl bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>



            {/* Orders Table-ish List */}
            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <OrderCardSkeleton key={i} />)
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order: any) => (
                        <div key={order._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all p-8 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

                            <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                                {/* Left Side: Order Info */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                        {order.returns?.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                                <FaUndo size={8} /> Returned
                                            </div>
                                        )}
                                        <span className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">#{order._id.slice(-8).toUpperCase()}</span>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl text-primary border border-gray-100 shadow-inner">
                                            <FaUser />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xl font-black text-gray-800 mb-1 truncate">{order.customer?.name}</h3>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 tracking-widest leading-none">
                                                <span className="lowercase">{order.customer?.email}</span>
                                                <span className="text-gray-300">|</span>
                                                <span>{order.customer?.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                                                    <FaCalendarAlt size={10} />
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                    <FaRupeeSign size={10} />
                                                    {order.totalPrice}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items Vertical Flow Columns */}
                                    <div className={`columns-2 gap-3 mt-4 space-y-3 ${order.items.length > 10 ? 'max-h-60 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                                        {order.items.map((item: any, idx: number) => {
                                            const originalItem = order.isAdminModified ? order.originalItems?.find((oi: any) => oi.name === item.name) : null;
                                            const isAdjusted = originalItem && originalItem.quantity !== item.quantity;
                                            return (
                                                <div key={idx} className={`flex items-center gap-3 p-3 pr-5 rounded-2xl border transition-all border-dashed break-inside-avoid ${isAdjusted ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/50 border-gray-100'}`}>
                                                    <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black shadow-sm border ${isAdjusted ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-white text-primary border-gray-50'}`}>
                                                        {item.quantity}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight leading-none mb-1 truncate">
                                                            {item.name}
                                                            {isAdjusted && <span className="ml-1 text-[7px] text-amber-500 font-black">●</span>}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-400">₹{item.price}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="lg:w-72 flex flex-col justify-between border-l border-gray-50 lg:pl-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Order Actions</p>

                                        <div className="flex flex-col gap-3">
                                            {/* Status-specific primary actions */}
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setEditedItems([...order.items]);
                                                        setProcessingConfirmModal(true);
                                                    }}
                                                    className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                                >
                                                    <FaTruck size={14} /> Process Order
                                                </button>
                                            )}
                                            {order.status === 'processing' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'shipped')}
                                                    className="w-full py-4 bg-purple-600 text-white hover:bg-purple-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100"
                                                >
                                                    <FaTruck size={14} /> Ship Order
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setDeliveryModal(true);
                                                    }}
                                                    className="w-full py-4 bg-teal-600 text-white hover:bg-teal-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-100"
                                                >
                                                    <FaCheckCircle size={14} /> Deliver Order
                                                </button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setReturnItems(order.items.map((i: any) => ({ ...i, returnQuantity: 0 })));
                                                        setReturnModal(true);
                                                    }}
                                                    className="w-full py-4 bg-amber-500 text-white hover:bg-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                                                >
                                                    <FaUndo size={14} /> Initiate Return
                                                </button>
                                            )}

                                            {/* Cancellation - Only for pending orders */}
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setCancellationModal(true);
                                                    }}
                                                    className="w-full py-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-red-100"
                                                >
                                                    <FaTimes /> Cancel Order
                                                </button>
                                            )}

                                            {/* Full Status Badges for terminal states */}
                                            {order.status === 'cancelled' && (
                                                <div className="py-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center justify-center gap-2">
                                                    <div className="h-10 w-10 bg-red-500 text-white rounded-full flex items-center justify-center">
                                                        <FaTimesCircle size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Order Cancelled</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setSelectedOrder(order); setInvoiceModal(true); }}
                                        className="w-full mt-6 py-4 bg-primary/10 text-primary border-2 border-primary/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-primary hover:text-white flex items-center justify-center gap-2 group"
                                    >
                                        <FaFileInvoice className="group-hover:scale-110 transition-transform" /> View Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 bg-white rounded-[48px] border-2 border-dashed border-gray-100 text-center">
                        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <FaShoppingBag size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Safe! No Records Found</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Adjust your filters or synchronization settings</p>
                    </div>
                )}
            </div>

            {/* --- Modals --- */}

            {/* Cancellation Modal */}
            {
                cancellationModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 scale-in-center custom-scrollbar">
                            <div className="p-8 bg-red-600 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black">Cancel Order</h2>
                                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Please provide a reason</p>
                                </div>
                                <button onClick={() => setCancellationModal(false)} className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                            </div>
                            <div className="p-8 space-y-6">
                                <textarea
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold text-gray-700 transition-all resize-none h-32"
                                    placeholder="E.g., Out of stock, Customer request..."
                                />
                                <button
                                    onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled', { reason: cancellationReason })}
                                    disabled={!cancellationReason || updating}
                                    className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {updating ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delivery Slip Modal */}
            {
                deliveryModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in duration-300 custom-scrollbar">
                            {/* Header */}
                            <div className={`p-8 ${modalStatus === 'error' ? 'bg-red-600' : modalStatus === 'success' ? 'bg-teal-600' : 'bg-primary'} text-white flex justify-between items-center relative overflow-hidden transition-colors duration-500`}>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black">
                                        {modalStatus === 'success' ? 'Verified!' : modalStatus === 'error' ? 'Upload Failed' : 'Delivery Verification'}
                                    </h2>
                                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">
                                        {modalStatus === 'success' ? 'Process complete' : modalStatus === 'error' ? 'Something went wrong' : 'Upload proof of delivery'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { if (modalStatus !== 'uploading') setDeliveryModal(false); }}
                                    disabled={modalStatus === 'uploading'}
                                    className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    <FaTimes />
                                </button>
                                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                            </div>

                            <div className="p-8 space-y-6 relative">
                                {/* States Overlays */}
                                {modalStatus === 'uploading' && (
                                    <div className="absolute inset-x-8 top-8 bottom-8 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 rounded-[32px] animate-in fade-in zoom-in duration-300">
                                        <div className="relative h-20 w-20 flex items-center justify-center">
                                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                                            <FaCamera className="text-primary animate-pulse" size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-gray-800 uppercase tracking-tighter">Uploading Proof...</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Processing secure upload</p>
                                        </div>
                                    </div>
                                )}

                                {modalStatus === 'success' && (
                                    <div className="absolute inset-x-8 top-8 bottom-8 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 rounded-[32px] animate-in fade-in zoom-in duration-300">
                                        <div className="h-20 w-20 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-teal-200 animate-bounce">
                                            <FaCheckCircle size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-teal-600 uppercase tracking-tighter text-lg">Delivery Completed!</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status updated successfully</p>
                                        </div>
                                    </div>
                                )}

                                {/* Main Content */}
                                <div className={`space-y-6 ${modalStatus === 'uploading' || modalStatus === 'success' ? 'opacity-20 blur-[2px]' : ''} transition-all duration-500`}>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                setDeliveryFile(e.target.files?.[0] || null);
                                                setModalStatus('idle');
                                            }}
                                            className="hidden"
                                            id="deliverySlip"
                                            disabled={modalStatus === 'uploading'}
                                        />
                                        <label
                                            htmlFor="deliverySlip"
                                            className={`flex flex-col items-center justify-center gap-4 p-10 border-4 border-dashed rounded-[32px] cursor-pointer transition-all ${modalStatus === 'error' ? 'border-red-100 bg-red-50/10' : 'border-gray-50 bg-gray-50/20 hover:border-primary/50 hover:bg-primary/5'
                                                } group-hover:scale-[0.98]`}
                                        >
                                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl transition-all ${modalStatus === 'error' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'
                                                } group-hover:rotate-12`}>
                                                <FaCamera />
                                            </div>
                                            <div className="text-center max-w-full px-4 text-pretty">
                                                <span className="text-sm font-black text-gray-800 uppercase tracking-tighter truncate block">
                                                    {deliveryFile ? deliveryFile.name : 'Take Photo or Upload Slip'}
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">JPG, PNG supported</p>
                                            </div>
                                        </label>
                                    </div>

                                    {modalStatus === 'error' && (
                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                            <FaTimesCircle className="text-red-500 flex-shrink-0" />
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-tight">{statusMessage}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered', { file: deliveryFile })}
                                        disabled={!deliveryFile || modalStatus === 'uploading'}
                                        className={`w-full py-5 rounded-[24px] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 ${modalStatus === 'error' ? 'bg-red-600 shadow-red-100' : 'bg-primary shadow-blue-100 hover:bg-teal-700'
                                            }`}
                                    >
                                        {modalStatus === 'error' ? 'RETRY UPLOAD' : 'COMPLETE DELIVERY'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Detailed Invoice Modal */}
            {
                invoiceModal && selectedOrder && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/20 relative">
                            {/* Status Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                                <h1 className="text-[180px] font-black uppercase -rotate-12">{selectedOrder.status}</h1>
                            </div>

                            <div className="p-12 space-y-10 relative z-10">
                                {/* Modal Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter mb-4 ${getStatusStyle(selectedOrder.status)}`}>
                                            {getStatusIcon(selectedOrder.status)}
                                            {selectedOrder.status}
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Order Summary</h2>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Transaction ID: #{selectedOrder._id.toUpperCase()}</p>
                                    </div>
                                    <button onClick={() => setInvoiceModal(false)} className="h-12 w-12 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all"><FaTimes /></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Customer & Info */}
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Details</h4>
                                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                                <p className="text-lg font-black text-gray-800 mb-1">{selectedOrder.customer?.name}</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{selectedOrder.customer?.type} Partner</p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-gray-100/50">
                                                        <FaAt className="text-primary flex-shrink-0" size={14} />
                                                        <p className="text-xs font-bold text-gray-600 truncate">{selectedOrder.customer?.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-gray-100/50">
                                                        <FaMobileAlt className="text-primary flex-shrink-0" size={14} />
                                                        <p className="text-xs font-bold text-gray-600">{selectedOrder.customer?.phone}</p>
                                                    </div>
                                                    <div className="flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-gray-100/50 md:col-span-2">
                                                        <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" size={14} />
                                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{formatAddress(selectedOrder.customer?.address)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedOrder.status === 'cancelled' && (
                                            <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                                                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Cancellation Reason</h4>
                                                <p className="text-sm font-bold text-red-800 italic">"{selectedOrder.cancellationReason}"</p>
                                            </div>
                                        )}

                                        {selectedOrder.deliverySlipUrl && (
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Delivery Proof</h4>
                                                <div className="rounded-3xl overflow-hidden border-4 border-teal-50 shadow-xl group cursor-pointer">
                                                    <img
                                                        src={selectedOrder.deliverySlipUrl}
                                                        alt="Delivery Slip"
                                                        className="w-full h-auto hover:scale-105 transition-transform duration-500"
                                                        onClick={() => window.open(selectedOrder.deliverySlipUrl, '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items & History */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className={`columns-2 gap-3 space-y-3 ${selectedOrder.items.length > 10 ? 'max-h-60 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                                                {selectedOrder.items.map((item: any, i: number) => {
                                                    const originalItem = selectedOrder.isAdminModified ? selectedOrder.originalItems?.find((oi: any) => oi.name === item.name) : null;
                                                    const isAdjusted = originalItem && originalItem.quantity !== item.quantity;
                                                    const returnedQty = selectedOrder.returns?.filter((r: any) => r.name === item.name).reduce((acc: number, r: any) => acc + r.quantity, 0) || 0;

                                                    return (
                                                        <div key={i} className={`flex flex-col bg-gray-50/50 p-4 rounded-2xl border border-dashed hover:bg-white transition-all break-inside-avoid ${isAdjusted ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-4 min-w-0">
                                                                    <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs shadow-sm ${isAdjusted ? 'bg-amber-100 text-amber-600' : 'bg-white text-primary'}`}>
                                                                        x{item.quantity}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11px] font-black text-gray-700 uppercase truncate">{item.name}</p>
                                                                        {isAdjusted && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase block w-fit mt-1">Adjusted</span>}
                                                                        {returnedQty > 0 && <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase block w-fit mt-1">Returned: {returnedQty}</span>}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs font-black text-gray-800 ml-2 whitespace-nowrap">₹{item.price}</p>
                                                            </div>
                                                            {isAdjusted && (
                                                                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-2 border-t border-amber-100 pt-2 text-center">
                                                                    Original: {originalItem.quantity} <FaArrowRight size={8} className="inline mx-1" /> {item.quantity}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Show Removed Items */}
                                            {selectedOrder.isAdminModified && selectedOrder.originalItems?.filter((oi: any) => !selectedOrder.items.some((ni: any) => ni.name === oi.name)).length > 0 && (
                                                <div className="space-y-2 mt-6">
                                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Removed from Order</p>
                                                    <div className="columns-2 gap-3 space-y-3">
                                                        {selectedOrder.originalItems?.filter((oi: any) => !selectedOrder.items.some((ni: any) => ni.name === oi.name)).map((removed: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-red-50/30 border border-red-50/50 opacity-60 break-inside-avoid">
                                                                <div className="flex items-center gap-4 opacity-50">
                                                                    <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center text-[10px] font-black text-red-400 line-through">
                                                                        x{removed.quantity}
                                                                    </div>
                                                                    <p className="text-[11px] font-black text-red-800/80 uppercase tracking-tight line-through truncate">{removed.name}</p>
                                                                </div>
                                                                <span className="text-[8px] font-black bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase">Removed</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Show Returns History */}
                                        {selectedOrder.returns?.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <FaUndo size={10} /> Internal Return History
                                                </p>
                                                <div className="space-y-3">
                                                    {selectedOrder.returns.map((ret: any, idx: number) => (
                                                        <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                                                                        x{ret.quantity}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-800 uppercase">{ret.name}</p>
                                                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                                                                            {new Date(ret.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-black text-amber-700">₹{ret.price * ret.quantity}</p>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-amber-600 bg-white/50 p-2 rounded-lg border border-amber-100/50">
                                                                Reason: {ret.reason}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-col gap-4">
                                            {selectedOrder.isAdminModified && (
                                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                                    <div className="h-8 w-8 bg-amber-500 text-white rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-200">
                                                        <FaExclamationTriangle size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-amber-700 uppercase tracking-tight">Admin Modified Order</p>
                                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-1">
                                                            The payable amount was {selectedOrder.totalPrice > selectedOrder.originalTotalPrice ? 'increased' : 'reduced'} by ₹{Math.abs(selectedOrder.originalTotalPrice - selectedOrder.totalPrice)}. Original total was ₹{selectedOrder.originalTotalPrice} and the new total is ₹{selectedOrder.totalPrice}.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center px-4 py-4 bg-primary rounded-2xl text-white shadow-xl shadow-blue-100">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                                <div className="flex items-center gap-3">
                                                    {selectedOrder.isAdminModified && (
                                                        <span className="text-xs font-bold text-white/50 line-through">₹{selectedOrder.originalTotalPrice}</span>
                                                    )}
                                                    <span className="text-xl font-black">₹{selectedOrder.totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Status History</h4>
                                        <div className="space-y-4">
                                            {selectedOrder.statusHistory?.map((h: any, i: number) => (
                                                <div key={i} className="flex items-center gap-4 relative">
                                                    {i !== selectedOrder.statusHistory.length - 1 && (
                                                        <div className="absolute left-3.5 top-8 w-0.5 h-6 bg-gray-100" />
                                                    )}
                                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[8px] border-2 ${h.status === selectedOrder.status ? 'bg-primary border-primary text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                                                        {h.status[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${h.status === selectedOrder.status ? 'text-gray-800' : 'text-gray-400'}`}>{h.status}</p>
                                                        <p className="text-[9px] font-bold text-gray-300">{new Date(h.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Return Items Modal */}
            {/* Return Items Modal */}
            {
                returnModal && selectedOrder && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-white/20 animate-in zoom-in duration-300 flex flex-col">
                            {returnSuccess ? (
                                <div className="p-16 text-center space-y-8 flex-1 flex flex-col items-center justify-center">
                                    <div className="h-32 w-32 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center animate-bounce shadow-inner">
                                        <FaCheckCircle size={64} />
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Return Successful!</h2>
                                        <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                                            The items have been processed and the customer's account has been adjusted accordingly.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setReturnModal(false);
                                            setReturnSuccess(false);
                                            setReturnItems([]);
                                            setReturnReason('');
                                        }}
                                        className="px-16 py-5 bg-teal-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-200 hover:bg-teal-700 transition-all hover:-translate-y-1 active:scale-95 text-xs"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Fixed Header */}
                                    <div className="p-10 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                                        <div className="relative z-10">
                                            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                                <FaUndo size={20} />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tighter">Return Processing</h2>
                                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Select items and quantities to return</p>
                                        </div>
                                        <button onClick={() => setReturnModal(false)} className="relative z-10 h-12 w-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all group">
                                            <FaTimes className="group-hover:rotate-90 transition-transform" />
                                        </button>
                                        <div className="absolute top-0 right-0 h-48 w-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="p-10 overflow-y-auto flex-1 custom-scrollbar space-y-8 bg-gray-50/30">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Returnable Items</p>
                                            <div className="space-y-3">
                                                {returnItems.map((item, idx) => {
                                                    const returnedQty = selectedOrder.returns?.filter((r: any) => r.name === item.name).reduce((acc: number, r: any) => acc + r.quantity, 0) || 0;
                                                    const availableToReturn = item.quantity - returnedQty;

                                                    return (
                                                        <div key={idx} className={`flex items-center gap-6 bg-white rounded-3xl p-6 border transition-all duration-300 ${item.returnQuantity > 0 ? 'border-amber-400 shadow-xl shadow-amber-50 scale-[1.02]' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-base font-black text-gray-800 uppercase truncate">{item.name}</p>
                                                                    {returnedQty > 0 && (
                                                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full border border-amber-100 uppercase tracking-widest">Partially Returned</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <div className="px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivered: <span className="text-gray-600">{item.quantity}</span></p>
                                                                    </div>
                                                                    {returnedQty > 0 && (
                                                                        <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                                                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Previous: <span className="font-bold">{returnedQty}</span></p>
                                                                        </div>
                                                                    )}
                                                                    <div className={`px-3 py-1.5 rounded-xl border ${availableToReturn === 0 ? 'bg-gray-100 border-gray-200' : 'bg-teal-50 border-teal-100'}`}>
                                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${availableToReturn === 0 ? 'text-gray-400' : 'text-teal-600'}`}>Remaining: <span className="font-bold">{availableToReturn}</span></p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center bg-gray-50 rounded-[24px] border border-gray-100 p-2 gap-2 shadow-inner">
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...returnItems];
                                                                        if (newItems[idx].returnQuantity > 0) {
                                                                            newItems[idx].returnQuantity--;
                                                                            setReturnItems(newItems);
                                                                        }
                                                                    }}
                                                                    disabled={item.returnQuantity === 0}
                                                                    className={`h-12 w-12 rounded-[18px] flex items-center justify-center transition-all ${item.returnQuantity === 0 ? 'text-gray-200 cursor-not-allowed' : 'bg-white text-gray-400 hover:text-amber-600 hover:shadow-lg shadow-sm'}`}
                                                                >
                                                                    <FaMinus size={14} />
                                                                </button>
                                                                <div className="w-14 text-center text-xl font-black text-amber-600 tabular-nums">
                                                                    {item.returnQuantity}
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...returnItems];
                                                                        if (newItems[idx].returnQuantity < availableToReturn) {
                                                                            newItems[idx].returnQuantity++;
                                                                            setReturnItems(newItems);
                                                                        }
                                                                    }}
                                                                    disabled={item.returnQuantity === availableToReturn}
                                                                    className={`h-12 w-12 rounded-[18px] flex items-center justify-center transition-all ${item.returnQuantity === availableToReturn ? 'text-gray-200 cursor-not-allowed' : 'bg-white text-gray-400 hover:text-amber-600 hover:shadow-lg shadow-sm'}`}
                                                                >
                                                                    <FaPlus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Return Reason (Optional)</label>
                                            <textarea
                                                value={returnReason}
                                                onChange={(e) => setReturnReason(e.target.value)}
                                                placeholder="Admin note only..."
                                                className="w-full bg-white border-2 border-gray-100 rounded-3xl p-8 text-sm font-medium focus:border-amber-400 transition-all outline-none min-h-[140px] hover:border-gray-200 resize-none shadow-sm focus:shadow-xl focus:shadow-amber-50/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Fixed Footer */}
                                    <div className="p-10 bg-white border-t border-gray-100 flex-shrink-0">
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[32px] p-8 border-2 border-amber-100/50 relative overflow-hidden group">
                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest opacity-60">Financial Review</p>
                                                    <p className="text-3xl font-black text-amber-800 tracking-tighter">₹{returnItems.reduce((acc, item) => acc + (item.price * item.returnQuantity), 0)}</p>
                                                    <p className="text-[9px] text-amber-600 font-bold uppercase tracking-[0.1em] mt-1 italic">* This amount will be adjusted in customer's due amount</p>
                                                </div>
                                                <button
                                                    disabled={returnItems.every(i => i.returnQuantity === 0) || returnProcessing}
                                                    onClick={() => {
                                                        const finalReturns = returnItems
                                                            .filter(i => i.returnQuantity > 0)
                                                            .map(i => ({ name: i.name, quantity: i.returnQuantity, reason: returnReason }));
                                                        handleReturnItems(selectedOrder._id, finalReturns);
                                                    }}
                                                    className="px-12 py-5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-xs"
                                                >
                                                    {returnProcessing ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaUndo size={14} />}
                                                    Process Return
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Processing Confirmation Modal */}
            {
                processingConfirmModal && selectedOrder && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in duration-300 custom-scrollbar">
                            <div className="p-8 bg-blue-600 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black">Review & Process</h2>
                                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Partial Approval Workflow</p>
                                </div>
                                <button onClick={() => setProcessingConfirmModal(false)} className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Order ID</p>
                                        <p className="text-sm font-black text-gray-800 tracking-tighter">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Approved Total</p>
                                        <p className="text-xl font-black text-blue-600 tracking-tighter">
                                            ₹{editedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    {editedItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 group">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-800 uppercase truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">₹{item.price} per unit</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...editedItems];
                                                            if (newItems[idx].quantity > 1) {
                                                                newItems[idx].quantity--;
                                                                setEditedItems(newItems);
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-gray-50 text-gray-400 transition-colors"
                                                    >
                                                        <FaMinus size={10} />
                                                    </button>
                                                    <div className="w-8 text-center text-xs font-black text-gray-800">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...editedItems];
                                                            newItems[idx].quantity++;
                                                            setEditedItems(newItems);
                                                        }}
                                                        className="p-2 hover:bg-gray-50 text-gray-400 transition-colors"
                                                    >
                                                        <FaPlus size={10} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setEditedItems(editedItems.filter((_, i) => i !== idx));
                                                    }}
                                                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                    title="Remove Item"
                                                >
                                                    <FaTrashAlt size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {editedItems.length === 0 && (
                                        <div className="p-10 text-center bg-red-50 rounded-3xl border-2 border-dashed border-red-100">
                                            <FaExclamationTriangle size={32} className="text-red-300 mx-auto mb-3" />
                                            <p className="text-xs font-black text-red-600 uppercase">Order cannot be empty!</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100/50">
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-relaxed">
                                        <span className="font-black">⚠️ Status:</span> Modifications will adjust the customer's due amount. Confirming will disable cancellation.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setProcessingConfirmModal(false)}
                                        className="py-4 rounded-2xl border-2 border-gray-100 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder._id, 'processing', { modifiedItems: editedItems });
                                        }}
                                        disabled={editedItems.length === 0 || updating}
                                        className="py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {updating ? 'PROCESSING...' : 'CONFIRM & PROCESS'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminOrders;
