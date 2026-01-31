import { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
    _id: string; // medicine id
    name: string;
    price: number;
    trp?: number;
    imageUrl?: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const userRef = useRef(user?._id);

    // Dynamic key based on logged in user
    const getCartKey = () => user ? `cartItems_${user._id}` : 'cartItems_guest';

    // Load cart items when user changes
    useEffect(() => {
        const key = getCartKey();
        const saved = localStorage.getItem(key);
        setCartItems(saved ? JSON.parse(saved) : []);
        
        // Handle logout: If user was logged in and now is null, clear the state
        if (userRef.current && !user) {
            setCartItems([]);
        }
        userRef.current = user?._id;
    }, [user]);

    // Save cart items when they change
    useEffect(() => {
        const key = getCartKey();
        localStorage.setItem(key, JSON.stringify(cartItems));
    }, [cartItems, user]);

    const addToCart = (item: CartItem) => {
        setCartItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(i => i._id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item._id === id) {
                    const newQty = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.trp || item.price) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
