import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaHeartbeat, FaChevronLeft } from 'react-icons/fa';

const TermsOfService = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);
    }, []);

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 px-6">
            <div className="max-w-4xl mx-auto pt-10">
                {/* Unified Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-800 transition-all hover:-translate-x-1 group"
                >
                    <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-blue-100 group-hover:shadow-md">
                        <FaChevronLeft />
                    </div>
                    <span>Back</span>
                </button>

                <main className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 p-8 md:p-16 border border-slate-100 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100">
                                <FaHeartbeat className="animate-pulse" />
                                Policy & Terms
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Terms of Service</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12 flex items-center gap-2">
                                Effective Date: <span className="text-blue-600 underline decoration-2 underline-offset-4">{currentDate}</span>
                            </p>

                            <div className="prose prose-slate max-w-none space-y-10">
                                <p className="text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 border-blue-500 pl-6 py-2">
                                    By accessing or using SVPharma services, you agree to the following Terms of Service. Please read them carefully to understand our mutual obligations and ensure a smooth experience.
                                </p>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                                        Service Overview
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        SVPharma provides an online platform for medicine ordering, account management, and order tracking between customers and administrators.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                                        Account Usage
                                    </h2>
                                    <ul className="grid md:grid-cols-3 gap-4 list-none p-0">
                                        {[
                                            'Users must provide accurate information during registration',
                                            'Accounts are for authorized use only',
                                            'Misuse may result in suspension or termination'
                                        ].map((item, i) => (
                                            <li key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-bold text-slate-700 text-xs uppercase tracking-wider text-center flex flex-col items-center justify-center gap-4">
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="space-y-4 p-8 bg-blue-50 rounded-[32px] border border-blue-100 shadow-inner">
                                    <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">3</span>
                                        Orders and Payments
                                    </h2>
                                    <div className="space-y-2">
                                        {[
                                            'Orders placed are subject to availability',
                                            'Payments may be partial or full as per agreement',
                                            'Due amounts will increase on order placement and reduce upon payment'
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-200/50 font-bold text-blue-900 text-sm">
                                                <span className="text-blue-500 font-black">→</span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">4</span>
                                        Account Approval
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-4">
                                            <div className="h-8 w-8 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 text-xs font-black">A</div>
                                            <p className="text-xs font-bold text-slate-600">New account requests are reviewed by the administrator</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-4">
                                            <div className="h-8 w-8 shrink-0 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500 text-xs font-black">B</div>
                                            <p className="text-xs font-bold text-slate-600">Approved requests result in account creation</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-4 sm:col-span-2">
                                            <div className="h-8 w-8 shrink-0 bg-red-50 rounded-lg flex items-center justify-center text-red-500 text-xs font-black">C</div>
                                            <p className="text-xs font-bold text-slate-600">Rejected requests will receive a rejection message with the reason</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">5</span>
                                        Communication
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">SVPharma sends emails only for:</p>
                                    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 list-none p-0">
                                        {['Account creation', 'OTP verification', 'Password recovery', 'Security updates'].map((item, i) => (
                                            <li key={i} className="bg-slate-50 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 text-center border border-slate-100">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                        We do not send promotional or unnecessary emails.
                                    </p>
                                </section>

                                <section className="space-y-4 p-6 border-2 border-dashed border-slate-200 rounded-[32px]">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">6</span>
                                        Admin Rights
                                    </h2>
                                    <ul className="space-y-3 list-none p-0 font-bold text-slate-600 text-sm">
                                        <li className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            Approve or reject account requests
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            Update orders, payments, and account details
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            Manage medicines, pricing, and availability
                                        </li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">7</span>
                                        User Conduct
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">Users must not:</p>
                                    <ul className="grid sm:grid-cols-3 gap-4 list-none p-0">
                                        {['Provide false information', 'Attempt unauthorized access', 'Misuse the platform'].map((item, i) => (
                                            <li key={i} className="bg-red-50 p-4 rounded-xl text-red-700 text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">8</span>
                                        Limitation of Liability
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                        SVPharma is not responsible for losses caused by misuse, incorrect information, or service interruptions beyond reasonable control.
                                    </p>
                                </section>

                                <section className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">9</span>
                                            Changes
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                            Terms may be updated periodically. Continued usage indicates acceptance of the revised terms.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                            <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">10</span>
                                            Law
                                        </h2>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                            These terms are governed by applicable local laws.
                                        </p>
                                    </div>
                                </section>

                                <section className="pt-12 border-t border-slate-100 text-center">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        By using this platform, you acknowledge that you have read and agreed to these terms.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TermsOfService;
