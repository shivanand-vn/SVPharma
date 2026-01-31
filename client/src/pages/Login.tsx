import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';

import Logo from '../assets/Logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext); // Destructure user
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'developer') navigate('/');
            else navigate('/customer');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(username, password);
            if (user) {
                showNotification(`Welcome back, ${user.username}!`, 'success');
                if (user.role === 'admin') navigate('/admin');
                else if (user.role === 'developer') navigate('/');
                else navigate('/customer');
            }
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Login failed', 'error');
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
                    <p className="text-center text-teal-100 text-lg font-light tracking-wide">Excellence in Pharmaceutical Distribution</p>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-1/2 p-10 bg-white/95">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition duration-200"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition duration-200"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Forgot Username/Password Links */}
                        <div className="flex justify-between text-sm">
                            <Link to="/forgot-username" className="text-teal-300 hover:text-teal-100 hover:underline transition-colors">
                                Forgot Username?
                            </Link>
                            <Link to="/forgot-password" className="text-teal-300 hover:text-teal-100 hover:underline transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transform transition hover:scale-[1.02] duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>New Pharmacy?</p>
                        <Link to="/register" className="text-primary font-bold hover:underline mt-1 inline-block">Request Connection</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
