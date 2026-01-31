import React from 'react';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCreditCard, FaCheckCircle, FaShoppingBag, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);
    const [orderData, setOrderData] = React.useState<any>(null);

    // Keyboard accessibility for modal
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowClearConfirm(false);
                setShowSuccess(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const handleCheckout = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const orderItems = cartItems.map(item => ({
                medicine: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.trp || item.price,
                image: item.imageUrl
            }));

            const { data } = await api.post('/orders', {
                orderItems,
                totalPrice: cartTotal
            });

            setOrderData(data);
            setShowSuccess(true);
            clearCart();
            showNotification('Order placed successfully!', 'success');
        } catch (error: any) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Failed to place order. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 font-serif">Your Shopping Cart</h2>
                <Link to="/customer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:text-[#115e59] transition-colors py-2 px-4 bg-teal-50 rounded-xl border border-teal-100/50 w-fit">
                    <FaArrowLeft /> Back to Shopping
                </Link>
            </div>

            {cartItems.length === 0 && !showSuccess ? (
                <div className="text-center py-20 bg-white rounded-[40px] shadow-xl shadow-teal-900/5 border border-gray-100 animate-in fade-in zoom-in duration-500">
                    <div className="text-gray-100 text-[120px] mb-4 font-black">🛒</div>
                    <p className="text-2xl font-black text-gray-400 mb-8 uppercase tracking-widest">Your cart is empty</p>
                    <Link to="/customer" className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-105 transition-all">
                        <FaArrowLeft /> Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Items List */}
                    <div className="flex-1 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white p-4 md:p-6 rounded-[28px] md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 md:gap-6 transition-all hover:shadow-xl hover:shadow-teal-900/5 group">
                                <div className="flex items-center w-full md:w-auto gap-4 md:gap-6">
                                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-300 font-black text-[10px] bg-gray-50 uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-lg md:text-xl text-gray-800 mb-1 truncate">{item.name}</h3>
                                        <p className="text-sm text-primary font-black tracking-tight">₹{item.trp || item.price}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item._id, -1)}
                                            className="px-3 py-2 hover:bg-white text-gray-400 hover:text-primary transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="px-2 font-black text-primary min-w-[30px] text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, 1)}
                                            className="px-3 py-2 hover:bg-white text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                    <div className="font-black text-xl md:text-2xl text-gray-800 md:w-24 text-right tracking-tight">₹{((item.trp || item.price) * item.quantity).toFixed(0)}</div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="p-2 md:p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all active:scale-95"
                                    >
                                        <FaTrash size={14} className="md:text-base" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Summary */}
                    {!showSuccess && cartItems.length > 0 && (
                        <div className="lg:w-[400px]">
                            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-teal-900/5 border border-gray-100 sticky top-24">
                                <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-gray-800 font-serif">Order Summary</h3>

                                <div className="space-y-4 md:space-y-5 mb-8 md:mb-10">
                                    <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-gray-800">₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                                        <span>Tax estimate</span>
                                        <span className="text-gray-800">₹0</span>
                                    </div>
                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                        <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest pb-1">Order Total</span>
                                        <span className="text-3xl md:text-4xl font-black text-primary tracking-tight">₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className={`w-full ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'} bg-primary text-white font-black py-4 md:py-5 rounded-[20px] md:rounded-[22px] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-base md:text-lg`}
                                    >
                                        {loading ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                    <button
                                        onClick={() => setShowClearConfirm(true)}
                                        className="w-full py-4 text-gray-300 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        Clear My Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Order Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in slide-in-from-bottom-8 duration-500 custom-scrollbar">
                        <div className="bg-gradient-to-br from-teal-500 to-primary p-12 text-center text-white relative">
                            <div className="absolute top-0 left-0 h-full w-full opacity-10 pointer-events-none overflow-hidden">
                                <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full" />
                                <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-900/20 scale-110">
                                    <FaCheckCircle className="text-teal-500 text-5xl" />
                                </div>
                                <h2 className="text-4xl font-black mb-3 font-serif">Perfect!</h2>
                                <p className="text-teal-50 font-bold opacity-90 text-lg uppercase tracking-widest">Order Placed Successfully</p>
                            </div>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center p-6 bg-teal-50 rounded-3xl border border-teal-100">
                                <div>
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Order ID</p>
                                    <p className="text-xl font-black text-teal-900 font-mono">#{orderData?._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                                    <p className="text-2xl font-black text-primary">₹{orderData?.totalPrice?.toFixed(0) || cartTotal.toFixed(0)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate('/customer/orders')}
                                    className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <FaShoppingBag /> See Order
                                </button>
                                <button
                                    onClick={() => navigate('/customer')}
                                    className="w-full py-4 text-gray-400 hover:text-teal-600 font-bold transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Clear Cart Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 border border-white/20 custom-scrollbar">
                        <div className="p-10 text-center space-y-6">
                            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto text-3xl animate-bounce">
                                <FaTrash />
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-gray-800 font-serif mb-2">Clear Your Cart?</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                    Are you sure you want to remove all items? This action cannot be undone.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="py-4 rounded-2xl border-2 border-gray-100 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        clearCart();
                                        setShowClearConfirm(false);
                                    }}
                                    className="py-4 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-red-700 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Yes, Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
