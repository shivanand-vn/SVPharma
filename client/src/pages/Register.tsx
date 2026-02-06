import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { FaUserMd, FaClinicMedical, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import StructuredAddressForm from '../components/StructuredAddressForm';
import { emptyAddress } from '../types/address';
import Logo from '../assets/Logo.png';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: { ...emptyAddress },
        type: 'medical', // default
    });

    // Validation State
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phone: false
    });

    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Strict Validation Regex
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate a single field
    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'name':
                return value.trim().length < 3 ? 'Name must be at least 3 characters' : '';
            case 'phone':
                if (!value) return 'Mobile number is required';
                if (!phoneRegex.test(value)) return 'Must be 10 digits starting with 6, 7, 8, or 9';
                return '';
            case 'email':
                if (!value) return 'Email is required';
                if (!emailRegex.test(value)) return 'Invalid email address';
                return '';
            default:
                return '';
        }
    };

    // Update errors when form changes
    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            name: touched.name ? validateField('name', form.name) : '',
            email: touched.email ? validateField('email', form.email) : '',
            phone: touched.phone ? validateField('phone', form.phone) : '',
        }));
    }, [form, touched]);

    // Check if entire form is valid
    const isFormValid =
        !errors.name && !errors.email && !errors.phone &&
        form.name && form.email && form.phone &&
        form.address.city && form.address.state && form.address.pincode && form.address.district;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final Validation Check
        const nameErr = validateField('name', form.name);
        const emailErr = validateField('email', form.email);
        const phoneErr = validateField('phone', form.phone);

        if (nameErr || emailErr || phoneErr) {
            setErrors({ ...errors, name: nameErr, email: emailErr, phone: phoneErr });
            setTouched({ name: true, email: true, phone: true });
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/auth/request-connection', form);
            setSuccess('Request sent successfully! Our team will review your application.');
            setGeneralError('');
            // Reset form
            setForm({
                name: '',
                email: '',
                phone: '',
                address: { ...emptyAddress },
                type: 'medical',
            });
            setTouched({ name: false, email: false, phone: false });
        } catch (err: any) {
            setGeneralError(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Numeric only for phone
            const cleanValue = value.replace(/\D/g, '').slice(0, 10);
            setForm({ ...form, phone: cleanValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    return (
        <div className="min-h-screen bg-teal-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row min-h-0 lg:min-h-[600px] animate-fade-in-up">

                {/* 1. Left Panel (Join Us) - Stacked on Mobile, Left on Desktop */}
                <div className="bg-teal-800 lg:w-5/12 p-8 lg:p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-pattern opacity-10 pointer-events-none"></div>
                    <div className="bg-white/10 p-4 rounded-2xl mb-6 backdrop-blur-sm transform transition hover:scale-105 duration-300">
                        <img src={Logo} alt="Logo" className="h-20 lg:h-28 w-auto drop-shadow-md" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4 tracking-wide">Join Our Network</h2>
                    <p className="opacity-90 leading-relaxed text-sm lg:text-base max-w-xs font-light">
                        Expand your business with the <span className="font-bold text-teal-200">SV Pharma</span> ecosystem.
                        We provide premium logistics, genuine medicines, and seamless digital management.
                    </p>

                    {/* Trust Indicators (Hidden on very small screens if needed, but good for trust) */}
                    <div className="mt-8 flex gap-4 opacity-75 text-xs font-bold uppercase tracking-widest">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 p-2 rounded-full mb-1"><FaCheck /></div>
                            <span>Verified</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 p-2 rounded-full mb-1"><FaCheck /></div>
                            <span>Secure</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 p-2 rounded-full mb-1"><FaCheck /></div>
                            <span>Fast</span>
                        </div>
                    </div>
                </div>

                {/* 2. Right Panel (Form) - Scrollable */}
                <div className="flex-1 p-6 lg:p-12 overflow-y-auto custom-scrollbar bg-white">
                    <div className="max-w-lg mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-serif">Request Account</h2>
                        <p className="text-gray-500 mb-8 text-sm">Fill in your details to get started.</p>

                        {generalError && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-3 animate-shake">
                                <FaExclamationTriangle className="text-lg shrink-0" />
                                <span className="font-medium">{generalError}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-teal-50 text-teal-800 p-8 rounded-2xl mb-6 text-center border-2 border-teal-100 shadow-sm animate-fade-in">
                                <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                                    <FaCheck className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
                                <p className="text-teal-700/80">{success}</p>
                            </div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Full Name / Store Name</label>
                                    <div className="relative">
                                        <input
                                            name="name"
                                            placeholder="e.g. City Pharmacy or Dr. Smith"
                                            value={form.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-5 py-3.5 rounded-xl border-2 ${errors.name ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-100 bg-gray-50 focus:border-teal-500 focus:bg-white focus:ring-teal-100'} outline-none focus:ring-4 transition-all font-medium text-gray-700 placeholder-gray-400`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 flex items-center gap-1"><FaTimes size={10} /> {errors.name}</p>}
                                    </div>
                                </div>

                                {/* Account Type Selection */}
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Account Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 relative overflow-hidden ${form.type === 'medical' ? 'border-teal-500 bg-teal-50/50 text-teal-800 ring-4 ring-teal-500/10' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="medical" checked={form.type === 'medical'} onChange={handleChange} className="hidden" />
                                            <div className={`p-3 rounded-full ${form.type === 'medical' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100'}`}>
                                                <FaClinicMedical size={20} />
                                            </div>
                                            <span className="font-bold text-sm">Medical Store</span>
                                            {form.type === 'medical' && <div className="absolute top-3 right-3 text-teal-600"><FaCheck size={12} /></div>}
                                        </label>

                                        <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 relative overflow-hidden ${form.type === 'doctor' ? 'border-teal-500 bg-teal-50/50 text-teal-800 ring-4 ring-teal-500/10' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="type" value="doctor" checked={form.type === 'doctor'} onChange={handleChange} className="hidden" />
                                            <div className={`p-3 rounded-full ${form.type === 'doctor' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100'}`}>
                                                <FaUserMd size={20} />
                                            </div>
                                            <span className="font-bold text-sm">Doctor</span>
                                            {form.type === 'doctor' && <div className="absolute top-3 right-3 text-teal-600"><FaCheck size={12} /></div>}
                                        </label>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Mobile Number</label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={form.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-5 py-3.5 rounded-xl border-2 ${errors.phone ? 'border-red-300 bg-red-50 focus:ring-red-200 error-shake' : 'border-gray-100 bg-gray-50 focus:border-teal-500 focus:bg-white focus:ring-teal-100'} outline-none focus:ring-4 transition-all font-medium text-gray-700 placeholder-gray-400`}
                                        />
                                        {errors.phone ? (
                                            <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 flex items-center gap-1"><FaTimes size={10} /> {errors.phone}</p>
                                        ) : (
                                            <p className="text-gray-400 text-[10px] mt-1.5 ml-1 font-medium tracking-wide">10 digits starting with 6-9</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-5 py-3.5 rounded-xl border-2 ${errors.email ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-100 bg-gray-50 focus:border-teal-500 focus:bg-white focus:ring-teal-100'} outline-none focus:ring-4 transition-all font-medium text-gray-700 placeholder-gray-400`}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1 flex items-center gap-1"><FaTimes size={10} /> {errors.email}</p>}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <StructuredAddressForm
                                        address={form.address}
                                        onChange={(address) => setForm({ ...form, address })}
                                        title="Delivery Address"
                                        showShopName={false}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !isFormValid}
                                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 ${submitting || !isFormValid ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5'}`}
                                >
                                    {submitting ? 'Sending Request...' : 'Submit Request'}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center border-t border-gray-100 pt-6">
                            <p className="text-gray-400 text-sm font-medium">Already have an account?</p>
                            <Link to="/login" className="text-teal-600 hover:text-teal-800 font-bold text-sm inline-block mt-1 hover:underline transition-all">Login to Dashboard</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
