import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPills, FaUsers, FaBoxOpen, FaTimes, FaSave, FaTrash, FaCheckCircle, FaExclamationCircle, FaChartLine, FaHistory, FaChevronDown, FaUndo } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import { formatAddress } from '../../utils/addressHelper';

// --- Skeleton Components ---
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-card p-6 flex flex-col items-center justify-center text-center h-48 border border-teal-50">
        <Skeleton className="h-14 w-14 rounded-full mb-4" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-16" />
    </div>
);

const AnalyticsSkeleton = () => (
    <div className="p-8 space-y-8 bg-teal-50/20">
        <Skeleton className="h-10 w-64 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-teal-50 h-[400px]">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <Skeleton className="h-full w-full" />
                </div>
            ))}
        </div>
    </div>
);

// --- Toast Notification Component ---
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
                {type === 'success' ? (
                    <FaCheckCircle className="text-2xl text-green-600" />
                ) : (
                    <FaExclamationCircle className="text-2xl text-red-600" />
                )}
                <p className="font-bold text-sm">{message}</p>
                <button onClick={onClose} className="ml-4 hover:opacity-70">
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

// --- Modals ---

const EditMedicineModal = ({ isOpen, onClose, medicine, onSave }: any) => {
    const [formData, setFormData] = useState<any>(medicine || {});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (medicine) {
            setFormData(medicine);
            setImagePreview(medicine.imageUrl || '');
        }
    }, [medicine]);

    if (!isOpen) return null;

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setUploading(true);
        try {
            let imageUrl = formData.imageUrl;

            // Upload new image if selected
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                const uploadRes = await api.post('/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
            }

            onSave({ ...formData, imageUrl });
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="bg-teal-700 p-4 flex justify-between items-center text-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold font-serif">Edit Medicine</h3>
                    <button onClick={onClose}><FaTimes size={20} /></button>
                </div>
                <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full border-2 border-teal-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-gray-700 font-medium cursor-pointer hover:border-teal-400 transition-colors">
                                <option value="Ethical">Ethical</option>
                                <option value="PCD">PCD</option>
                                <option value="Generic">Generic</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MRP</label>
                            <input type="number" name="mrp" value={formData.mrp || ''} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none no-spinner" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost</label>
                            <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none no-spinner" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Packing</label>
                            <input name="packing" value={formData.packing || ''} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Medicine Image</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border-2 border-dashed border-teal-200 rounded-lg px-4 py-3 focus:border-teal-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white file:cursor-pointer hover:file:bg-teal-700"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image or keep the existing one</p>
                            </div>
                            {imagePreview && (
                                <div className="w-24 h-24 border-2 border-teal-200 rounded-lg overflow-hidden">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold" disabled={uploading}>Cancel</button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, medicine, onConfirm, type = 'medicine' }: any) => {
    const [confirmName, setConfirmName] = useState('');

    if (!isOpen) return null;

    const isMatch = medicine && confirmName === medicine.name;
    const entityType = type === 'customer' ? 'Customer' : 'Medicine';
    const placeholderText = type === 'customer' ? 'Type customer name to confirm' : 'Type medicine name to confirm';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 relative border-2 border-red-200 custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <FaTrash className="text-2xl text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Delete {entityType}?</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    This action cannot be undone. To confirm deletion, please type <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded">"{medicine?.name}"</span> below.
                </p>

                <input
                    type="text"
                    placeholder={placeholderText}
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    className="w-full border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg px-4 py-3 outline-none transition-all mb-6 font-semibold text-gray-700 placeholder:text-gray-400"
                    autoFocus
                />

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-bold text-sm border-2 border-gray-200 transition-colors">Cancel</button>
                    <button
                        onClick={() => onConfirm(medicine._id)}
                        disabled={!isMatch}
                        className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 text-white transition-all shadow-lg ${isMatch ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl' : 'bg-gray-300 cursor-not-allowed opacity-50'}`}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// OTP Verification Modal for Customer Deletion
const OTPVerificationModal = ({ isOpen, onClose, customer, onVerify, loading }: any) => {
    const [otp, setOtp] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (otp.length === 6) {
            onVerify(otp);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 relative border-2 border-teal-200 custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-600"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-teal-100 rounded-full">
                        <FaCheckCircle className="text-2xl text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Enter OTP</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    An OTP has been sent to your admin email. Please enter the 6-digit code to confirm deletion of <span className="font-bold text-teal-600">{customer?.name}</span>.
                </p>

                <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full border-2 border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-4 py-3 outline-none transition-all mb-6 font-bold text-center text-2xl tracking-widest text-gray-700"
                    autoFocus
                    maxLength={6}
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-bold text-sm border-2 border-gray-200 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={otp.length !== 6 || loading}
                        className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 text-white transition-all shadow-lg ${otp.length === 6 && !loading
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 hover:shadow-xl'
                            : 'bg-gray-300 cursor-not-allowed opacity-50'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Verifying...
                            </>
                        ) : (
                            <>
                                <FaCheckCircle /> Verify & Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Analytics View Component ---
const AnalyticsView = ({ data }: { data: any }) => {
    if (!data) return <div className="p-8 text-center text-teal-600">Loading analytics...</div>;

    const COLORS = ['#0d9488', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef'];

    return (
        <div className="p-8 space-y-8 bg-teal-50/20">
            <h2 className="text-3xl font-serif text-teal-800 text-center mb-8">Business Analytics</h2>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-teal-700">₹{data.totalRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                    <p className="text-gray-500 text-sm font-medium">Total Volume</p>
                    <p className="text-3xl font-bold text-teal-700">{data.totalOrders} Orders</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                    <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
                    <p className="text-3xl font-bold text-teal-700">₹{data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                    <p className="text-gray-500 text-sm font-medium">Top Selling Product</p>
                    <p className="text-xl font-bold text-teal-700 truncate">{data.bestSellingProducts?.[0]?.name || 'N/A'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-teal-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Trend (Last 7 Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={data.salesTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-teal-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Customers by Spend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={data.topCustomers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Total Spend']}
                                />
                                <Bar dataKey="spend" fill="#0d9488" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-teal-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Best Selling Products</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={data.bestSellingProducts}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="quantity" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-teal-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Category</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <PieChart>
                                <Pie
                                    data={data.salesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.salesByCategory.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Sales']}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Customer Order History Modal ---
const CustomerOrdersModal = ({ isOpen, onClose, customer }: { isOpen: boolean, onClose: () => void, customer: any }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && customer) {
            setLoading(true);
            api.get(`/orders/customer/${customer._id}`)
                .then(res => setOrders(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 bg-teal-700 text-white flex justify-between items-center relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <FaHistory size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{customer?.name}'s Order History</h2>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">{customer?.type} • {orders.length} Total Orders</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                    <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <div className="h-16 w-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center text-teal-600 animate-spin">
                                <FaHistory size={30} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving transaction history...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div
                                        className="p-6 cursor-pointer hover:bg-teal-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                                <p className="text-sm font-black text-gray-800 tracking-tighter">#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="h-10 w-px bg-gray-100 hidden md:block" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                                                <p className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div className="h-10 w-px bg-gray-100 hidden md:block" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest block w-fit ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                            order.status === 'delivered' ? 'bg-teal-100 text-teal-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Amount</p>
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.isAdminModified && (
                                                        <span className="text-[10px] font-bold text-gray-400 line-through">₹{order.originalTotalPrice?.toFixed(2)}</span>
                                                    )}
                                                    <p className="text-lg font-black text-teal-700 tracking-tighter">₹{order.totalPrice?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className={`h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-transform duration-300 ${expandedOrder === order._id ? 'rotate-180' : ''}`}>
                                                <FaChevronDown size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {expandedOrder === order._id && (
                                        <div className="px-6 pb-6 pt-2 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Items ({order.items.length})</p>
                                                        <div className="space-y-2">
                                                            {order.items.map((item: any, idx: number) => {
                                                                const originalItem = order.isAdminModified ? order.originalItems?.find((oi: any) => oi.name === item.name) : null;
                                                                const isAdjusted = originalItem && originalItem.quantity !== item.quantity;
                                                                return (
                                                                    <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between ${isAdjusted ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isAdjusted ? 'bg-amber-100 text-amber-600' : 'bg-white text-teal-600'}`}>
                                                                                {item.quantity}x
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{item.name}</p>
                                                                                {isAdjusted && (
                                                                                    <p className="text-[8px] font-bold text-amber-500 uppercase">Adjusted from {originalItem.quantity}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-xs font-black text-gray-700">₹{item.price}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {order.isAdminModified && (
                                                            <div className="space-y-3">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modification Summary</p>
                                                                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-2">
                                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-teal-700">
                                                                        <span>Due Amount Adjustment</span>
                                                                        <span className="font-black text-teal-900">-₹{(order.originalTotalPrice - order.totalPrice).toFixed(2)}</span>
                                                                    </div>
                                                                    <p className="text-[9px] text-teal-600/70 font-medium leading-relaxed">
                                                                        The payable amount was {order.totalPrice > order.originalTotalPrice ? 'increased' : 'reduced'} by ₹{Math.abs(order.originalTotalPrice - order.totalPrice).toFixed(2)}. Original total was ₹{order.originalTotalPrice.toFixed(2)} and the new total is ₹{order.totalPrice.toFixed(2)}.
                                                                    </p>
                                                                </div>

                                                                {/* Return History */}
                                                                {order.returns?.length > 0 && (
                                                                    <div className="space-y-2 pt-2">
                                                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                                            <FaUndo size={10} /> Internal Return History
                                                                        </p>
                                                                        {order.returns.map((ret: any, idx: number) => (
                                                                            <div key={idx} className="p-3 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                                                                                <div className="flex justify-between items-center text-[10px] font-black text-amber-800 uppercase">
                                                                                    <span>{ret.quantity}x {ret.name}</span>
                                                                                    <span>₹{(ret.price * ret.quantity).toFixed(2)}</span>
                                                                                </div>
                                                                                <p className="text-[9px] font-bold text-amber-600 italic leading-tight">Reason: {ret.reason}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Show completely removed items if any */}
                                                                {order.originalItems?.filter((oi: any) => !order.items.some((ni: any) => ni.name === oi.name)).length > 0 && (
                                                                    <div className="space-y-2 pt-2">
                                                                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest ml-1">Removed Medicines</p>
                                                                        {order.originalItems.filter((oi: any) => !order.items.some((ni: any) => ni.name === oi.name)).map((removed: any, idx: number) => (
                                                                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/30 border border-red-50/50">
                                                                                <div className="flex items-center gap-3 opacity-50">
                                                                                    <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center text-[10px] font-black text-red-400 line-through">
                                                                                        {removed.quantity}x
                                                                                    </div>
                                                                                    <p className="text-xs font-black text-red-800/80 uppercase tracking-tight line-through">{removed.name}</p>
                                                                                </div>
                                                                                <span className="text-[8px] font-black bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase">Removed</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</p>
                                                            <div className="space-y-2">
                                                                {order.statusHistory?.map((h: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center gap-3">
                                                                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                                                                        <p className="text-[10px] font-bold text-gray-600 capitalize">{h.status} - {new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <FaBoxOpen size={40} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">No Orders Found</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">This customer hasn't placed any orders yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        medicines: 0,
        customers: 0,
        orders: 0,
        pendingOrders: 0
    });
    const [data, setData] = useState<any>({
        medicines: [],
        customers: [],
        orders: []
    });
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [activeView, setActiveView] = useState<'medicines' | 'customers' | 'orders' | 'analytics' | null>('analytics');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<any>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const openHistoryModal = (customer: any) => {
        setSelectedHistoryCustomer(customer);
        setHistoryModalOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const medRes = await api.get('/medicines');
            await api.get('/admin/connection-requests');
            const custRes = await api.get('/admin/customers');
            const orderRes = await api.get('/orders');
            const analyticsRes = await api.get('/admin/analytics');

            setAnalyticsData(analyticsRes.data);

            setData({
                medicines: medRes.data || [],
                customers: custRes.data || [],
                orders: orderRes.data || []
            });

            setStats({
                medicines: medRes.data.length || 0,
                customers: custRes.data.length || 0,
                orders: orderRes.data.length || 0,
                pendingOrders: orderRes.data.filter((o: any) => o.status === 'pending').length || 0
            });
        } catch (e) {
            console.error("Stats fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const openEditModal = (item: any) => {
        setSelectedItem(item);
        setEditModalOpen(true);
    };

    const openDeleteModal = (item: any) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleSaveEdit = async (updatedData: any) => {
        try {
            await api.put(`/medicines/${updatedData._id}`, updatedData);
            setEditModalOpen(false);
            setSelectedItem(null);
            fetchData(); // Refresh data
            showToast("Medicine updated successfully!", "success");
        } catch (error) {
            console.error("Update failed", error);
            showToast("Failed to update medicine.", "error");
        }
    };

    const handleConfirmDelete = async (id: string) => {
        // Check if it's a customer deletion (requires OTP)
        if (activeView === 'customers') {
            // Request OTP for customer deletion
            setOtpLoading(true);
            try {
                await api.post(`/admin/customers/${id}/request-delete-otp`);
                setDeleteModalOpen(false);
                setOtpModalOpen(true);
                showToast("OTP sent to your email!", "success");
            } catch (error) {
                console.error("Failed to request OTP", error);
                showToast("Failed to send OTP. Please try again.", "error");
            } finally {
                setOtpLoading(false);
            }
        } else {
            // Medicine deletion (no OTP required)
            try {
                await api.delete(`/medicines/${id}`);
                setDeleteModalOpen(false);
                setSelectedItem(null);
                fetchData();
                showToast("Medicine deleted successfully!", "success");
            } catch (error) {
                console.error("Delete failed", error);
                showToast("Failed to delete medicine.", "error");
            }
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        if (!selectedItem) return;

        setOtpLoading(true);
        try {
            await api.post(`/admin/customers/${selectedItem._id}/verify-delete-otp`, { otp });
            setOtpModalOpen(false);
            setSelectedItem(null);
            fetchData();
            showToast("Customer deleted successfully!", "success");
        } catch (error: any) {
            console.error("OTP verification failed", error);
            const message = error.response?.data?.message || "Invalid or expired OTP";
            showToast(message, "error");
        } finally {
            setOtpLoading(false);
        }
    };


    const cards = [
        { title: 'Total Medicines', count: stats.medicines, icon: <FaPills size={24} />, color: 'text-teal-600', view: 'medicines' },
        { title: 'Total Customers', count: stats.customers, icon: <FaUsers size={24} />, color: 'text-teal-600', view: 'customers' },
        { title: 'Orders', count: stats.orders, icon: <FaBoxOpen size={24} />, color: 'text-teal-600', view: 'orders' },
        { title: 'Analytics', count: 'View', icon: <FaChartLine size={24} />, color: 'text-teal-600', view: 'analytics' }
    ];

    return (
        <div className="space-y-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveView(card.view as any)}
                            className={`bg-white rounded-xl shadow-card p-6 flex flex-col items-center justify-center text-center h-48 border border-teal-50 transform hover:scale-105 transition-transform duration-300 cursor-pointer ${activeView === card.view ? 'ring-2 ring-teal-500 bg-teal-50' : ''}`}
                        >
                            <div className={`mb-4 ${card.color} bg-teal-50 p-4 rounded-full`}>
                                {card.icon}
                            </div>
                            <h3 className="text-gray-500 font-medium mb-2">{card.title}</h3>
                            <p className="text-4xl font-bold text-teal-800">{card.count}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Interactive View Area */}
            {activeView && activeView !== 'analytics' && (
                <div className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden animate-fade-in-up">
                    <ListView
                        type={activeView}
                        data={data[activeView]}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                        onHistory={openHistoryModal}
                    />
                </div>
            )}

            {activeView === 'analytics' && (
                <div className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden animate-fade-in-up">
                    {loading ? <AnalyticsSkeleton /> : <AnalyticsView data={analyticsData} />}
                </div>
            )}

            {!activeView && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-8 text-center text-teal-700">
                    <p className="text-lg">Click any card above to view detailed lists and manage records.</p>
                </div>
            )}

            {/* Modals */}
            <EditMedicineModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                medicine={selectedItem}
                onSave={handleSaveEdit}
            />
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                medicine={selectedItem}
                onConfirm={handleConfirmDelete}
                type={activeView === 'customers' ? 'customer' : 'medicine'}
            />
            <OTPVerificationModal
                isOpen={otpModalOpen}
                onClose={() => setOtpModalOpen(false)}
                customer={selectedItem}
                onVerify={handleVerifyOTP}
                loading={otpLoading}
            />

            <CustomerOrdersModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                customer={selectedHistoryCustomer}
            />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
};

const ListView = ({ type, data, onEdit, onDelete, onHistory }: { type: 'medicines' | 'customers' | 'orders', data: any[], onEdit: (item: any) => void, onDelete: (item: any) => void, onHistory: (item: any) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Calculate counts for filters
    const getCount = (filter: string, isType: boolean = false) => {
        if (filter === 'All') return data.length;
        if (type === 'medicines') {
            if (isType) return data.filter((item: any) => item.type === filter).length;
            return data.filter((item: any) => item.category === filter).length;
        }
        if (type === 'customers') return data.filter((item: any) => item.type === filter).length;
        return 0;
    };

    const categories = type === 'medicines'
        ? ['All', 'PCD', 'Generic', 'Ethical', 'Other']
        : type === 'customers'
            ? ['All', 'Doctor', 'Medical']
            : ['All'];

    const subCategories = type === 'medicines'
        ? [
            'All', 'Tablet', 'Syrup', 'Capsule', 'Drops', 'Pediatric Syrup',
            'Pediatric Drops & Suspentions', 'Injection', 'Soap',
            'Ointment/Cream', 'Protein Powder', 'Sachet', 'Dental', 'ENT'
        ]
        : [];

    const filteredData = data.filter(item => {
        const matchesSearch = type === 'medicines'
            ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
            : type === 'customers'
                ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
                : item._id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'All'
            ? true
            : type === 'medicines'
                ? item.category === categoryFilter
                : type === 'customers'
                    ? item.type === categoryFilter
                    : type === 'orders'
                        ? item.status === categoryFilter.toLowerCase()
                        : true;

        const matchesType = type === 'medicines' && typeFilter !== 'All'
            ? item.type === typeFilter
            : true;

        return matchesSearch && matchesCategory && matchesType;
    });

    return (
        <div className="p-6 bg-teal-50/30 min-h-[500px]">
            <h2 className="text-3xl font-serif text-teal-800 text-center mb-8">
                {type === 'orders' ? 'Order Management' : `Total ${type.charAt(0).toUpperCase() + type.slice(1)} List`}
            </h2>

            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    {/* Filter Tabs with Counts (Category/Status) */}
                    <div className="flex flex-wrap gap-2">
                        {type === 'orders' ? (
                            ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setCategoryFilter(status)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${categoryFilter === status
                                        ? 'bg-teal-800 text-white'
                                        : 'bg-white text-teal-700 hover:bg-teal-100 border border-teal-100'
                                        }`}
                                >
                                    {status} <span className="opacity-60 text-[9px] ml-1">({status === 'All' ? data.length : data.filter((o: any) => o.status === status.toLowerCase()).length})</span>
                                </button>
                            ))
                        ) : (
                            categories.map(cat => {
                                const count = getCount(cat);
                                if (type === 'medicines' && cat !== 'All' && count === 0) return null; // Hide empty categories
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${categoryFilter === cat
                                            ? 'bg-teal-800 text-white'
                                            : 'bg-white text-teal-700 hover:bg-teal-100'
                                            }`}
                                    >
                                        {cat} <span className="opacity-80 text-xs text-inherit">({count})</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder={type === 'orders' ? "Search Order ID..." : `Search ${type.slice(0, -1)}...`}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Second Filter Bar for Types (Sub-categories) */}
                {type === 'medicines' && (
                    <div className="flex flex-wrap gap-2 py-3 border-t border-teal-50">
                        {subCategories.map(sub => {
                            const count = getCount(sub, true);
                            if (sub !== 'All' && count === 0) return null; // Hide empty types
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setTypeFilter(sub)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${typeFilter === sub
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                                        }`}
                                >
                                    {sub} <span className="opacity-70 ml-1">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-xl shadow-lg border border-teal-100 bg-white mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-teal-900 text-white">
                        <tr>
                            {type === 'medicines' && (
                                <>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-16">S.No.</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider w-24">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Cost (₹)</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">MRP (₹)</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Packing</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider sticky right-0 bg-teal-900 z-10">Action</th>
                                </>
                            )}
                            {type === 'customers' && (
                                <>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider sticky right-0 bg-teal-900 z-10">Action</th>
                                </>
                            )}
                            {type === 'orders' && (
                                <>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Order Detail</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider sticky right-0 bg-teal-900 z-10">Action</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item: any, i) => (
                                <tr key={i} className="hover:bg-teal-50/50 transition-colors border-b border-gray-100">
                                    {type === 'medicines' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono w-16">{i + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium w-24">{item.type || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.description} style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-700 font-bold">₹{item.cost}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">₹{item.mrp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.packing}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)]">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => onEdit(item)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md">Edit</button>
                                                    <button onClick={() => onDelete(item)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md">Delete</button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    {type === 'customers' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-900">
                                                <button
                                                    onClick={() => onHistory(item)}
                                                    className="hover:text-teal-600 hover:underline transition-all text-left flex items-center gap-2 group"
                                                >
                                                    {item.name}
                                                    <FaHistory className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" size={12} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.email} style={{ maxWidth: '200px' }}>{item.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={formatAddress(item.address)}>
                                                {formatAddress(item.address)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)]">
                                                <button onClick={() => onDelete(item)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors shadow-sm">Delete</button>
                                            </td>
                                        </>
                                    )}
                                    {type === 'orders' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-black text-teal-900 uppercase tracking-tight">#{item._id.slice(-6)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-800">{item.customer?.name || 'Walk-in'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium italic">{item.customer?.type || 'Guest'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-700 font-black">₹{item.totalPrice?.toFixed(0) || '0'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                        item.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                            item.status === 'delivered' ? 'bg-teal-100 text-teal-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)]">
                                                <Link
                                                    to="/admin/orders"
                                                    state={{ highlightOrderId: item._id }}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm inline-flex items-center gap-2 group"
                                                >
                                                    Manage <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                </Link>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No {type} found matching your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
