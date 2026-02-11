import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Logo from '../assets/Logo.png';

const ForgotUsername = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/forgot-username', { email: email.trim() });

            // Success - email was sent
            setSuccess(true);
            setEmail(''); // Clear form
        } catch (err: any) {
            // Handle different error responses
            if (err.response?.status === 404) {
                // Email not found
                setError(err.response?.data?.message || 'No account is registered with this email address.');
            } else if (err.response?.status === 400) {
                // Validation error
                setError(err.response?.data?.message || 'Invalid email format');
            } else {
                // Server error or other
                setError(err.response?.data?.message || 'An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600 opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass flex flex-col md:flex-row w-full max-w-4xl overflow-hidden relative z-10">
                {/* Left Side: Brand */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center items-center text-white bg-primary/20">
                    <img src={Logo} alt="Logo" className="h-40 w-auto drop-shadow-2xl mb-6 hover:scale-105 transition-transform duration-300" />
                    <h1 className="text-3xl font-bold mb-2 text-center text-white drop-shadow-md">Shree Veerabhadreshwara Pharma</h1>
                    <p className="text-center text-teal-100 text-lg font-light tracking-wide">Username Recovery</p>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-1/2 p-10 bg-white/95">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Forgot Username?</h2>
                    <p className="text-gray-600 text-sm text-center mb-6">Enter your registered email address and we'll send you your username.</p>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                            <p className="font-bold text-sm mb-1">✓ Username Sent!</p>
                            <p className="text-sm">Your username has been sent to your registered email address.</p>
                            <p className="text-xs mt-2 text-green-600">Please check your inbox (and spam folder if needed).</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition duration-200"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transform transition hover:scale-[1.02] duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Username'}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-2">
                        <Link to="/login" className="text-primary font-bold hover:underline inline-block text-sm">
                            ← Back to Login
                        </Link>
                        <p className="text-gray-600 text-xs mt-4">
                            New Pharmacy?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Request Connection
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-6 text-[10px] uppercase font-black tracking-widest text-gray-400">
                        <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotUsername;
