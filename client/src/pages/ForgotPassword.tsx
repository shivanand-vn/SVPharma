import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Logo from '../assets/Logo.png';
import OTPInput from '../components/OTPInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Step 1: Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

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
            await api.post('/auth/forgot-password', { email: email.trim() });
            setStep(2); // Move to step 2
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('No account found with this email address.');
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            setLoading(false);
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Check password requirements
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const hasSpecial = /[@#$!%&]/.test(newPassword);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            setError('Password does not meet all requirements');
            setLoading(false);
            return;
        }

        try {
            await api.put('/auth/reset-password', {
                email: email.trim(),
                otp,
                newPassword
            });
            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
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
                    <p className="text-center text-teal-100 text-lg font-light tracking-wide">Password Reset</p>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-1/2 p-10 bg-white/95">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                                <p className="font-bold text-sm mb-1">✓ Password Reset Successful!</p>
                                <p className="text-sm">Redirecting to login...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                                {step === 1 ? 'Reset Password' : 'Enter OTP & New Password'}
                            </h2>
                            <p className="text-gray-600 text-sm text-center mb-6">
                                {step === 1
                                    ? 'Enter your email to receive a password reset OTP'
                                    : 'Check your email for the 6-digit OTP'}
                            </p>

                            {error && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Step 1: Email Input */}
                            {step === 1 && (
                                <form onSubmit={handleSendOTP} className="space-y-6">
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
                                        {loading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: OTP + Password */}
                            {step === 2 && (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    {/* Back button */}
                                    <button
                                        type="button"
                                        onClick={handleBackToStep1}
                                        className="flex items-center gap-2 text-primary text-sm hover:underline"
                                    >
                                        <FaArrowLeft /> Change Email
                                    </button>

                                    {/* OTP Input */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-3 text-center">Enter OTP</label>
                                        <OTPInput value={otp} onChange={setOtp} />
                                        <p className="text-xs text-gray-500 text-center mt-2">OTP sent to {email}</p>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition duration-200"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition duration-200"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <PasswordStrengthIndicator password={newPassword} />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6 || !newPassword || newPassword !== confirmPassword}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transform transition hover:scale-[1.02] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            <div className="mt-8 text-center space-y-2">
                                <Link to="/login" className="text-primary font-bold hover:underline inline-block text-sm">
                                    ← Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
