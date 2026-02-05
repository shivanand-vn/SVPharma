import React, { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { FaUserMd, FaClinicMedical } from 'react-icons/fa';
import StructuredAddressForm from '../components/StructuredAddressForm';
import type { Address } from '../components/StructuredAddressForm';
import Logo from '../assets/Logo.png';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            line1: '',
            city: '',
            state: '',
            pincode: ''
        } as Address,
        type: 'medical', // default
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict Mobile Number Validation
        if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) {
            setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
            return;
        }

        try {
            await api.post('/auth/request-connection', form);
            setSuccess('Request sent successfully! Our team will review your application.');
            setError('');
            // Reset form
            setForm({
                name: '',
                email: '',
                phone: '',
                address: {
                    line1: '',
                    city: '',
                    state: '',
                    pincode: ''
                } as Address,
                type: 'medical',
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-teal-50 p-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-0">
                {/* Left Panel */}
                <div className="bg-teal-800 p-8 md:p-12 flex flex-col justify-center items-center text-white md:w-5/12 text-center">
                    <div className="bg-white/10 p-4 rounded-xl mb-6">
                        <img src={Logo} alt="Logo" className="h-28 w-auto" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Join Us</h2>
                    <p className="opacity-80 leading-relaxed">Expand your business with the SV Pharma network. We provide premium logistics and genuine medicines.</p>
                </div>

                {/* Right Panel */}
                <div className="p-8 md:p-10 md:w-7/12 flex flex-col justify-center overflow-y-auto max-h-[85vh] md:max-h-none custom-scrollbar">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Request Account</h2>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 flex items-center gap-2">⚠️ {error}</div>}
                    {success && <div className="bg-green-50 text-green-600 p-6 rounded-lg mb-6 text-center border border-green-100 shadow-sm">
                        <div className="text-2xl mb-2">✅</div>
                        <p className="font-bold">Thank You!</p>
                        <p className="text-sm">{success}</p>
                    </div>}

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Full Name / Store Name</label>
                                <input
                                    name="name"
                                    placeholder="e.g. City Pharmacy or Dr. Smith"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Account Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${form.type === 'medical' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="medical"
                                            checked={form.type === 'medical'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <FaClinicMedical size={24} />
                                        <span>Medical Store</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${form.type === 'doctor' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="doctor"
                                            checked={form.type === 'doctor'}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <FaUserMd size={24} />
                                        <span>Doctor</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={form.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setForm({ ...form, phone: value });
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <StructuredAddressForm
                                address={form.address}
                                onChange={(address) => setForm({ ...form, address })}
                                title="Delivery Address"
                                showShopName={false} // Name field is already at the top
                            />

                            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 mt-2">
                                Submit Request
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-gray-500 hover:text-teal-600 font-medium transition-colors">Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
