import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaShieldAlt, FaHeartbeat, FaChevronLeft } from 'react-icons/fa';

const PrivacyPolicy = () => {
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
                    className="mb-8 flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-[0.2em] hover:text-teal-800 transition-all hover:-translate-x-1 group"
                >
                    <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-teal-100 group-hover:shadow-md">
                        <FaChevronLeft />
                    </div>
                    <span>Back</span>
                </button>

                <main className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-teal-900/5 p-8 md:p-16 border border-slate-100 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-teal-100">
                                <FaHeartbeat className="animate-pulse" />
                                Legal Documentation
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12 flex items-center gap-2">
                                Effective Date: <span className="text-teal-600 underline decoration-2 underline-offset-4">{currentDate}</span>
                            </p>

                            <div className="prose prose-slate max-w-none space-y-10">
                                <p className="text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 border-teal-500 pl-6 py-2">
                                    SVPharma respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website, mobile application, and services.
                                </p>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">1</span>
                                        Information We Collect
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">We may collect the following information:</p>
                                    <ul className="grid md:grid-cols-2 gap-3 list-none p-0">
                                        {[
                                            'Name, mobile number, email address',
                                            'Shop or business details',
                                            'Address and location details',
                                            'Order, payment, and transaction history',
                                            'Account and login information'
                                        ].map((item, i) => (
                                            <li key={i} className="bg-slate-50 flex items-center gap-4 p-4 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm">
                                                <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">2</span>
                                        How We Use Your Information
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">We use your information to:</p>
                                    <ul className="space-y-2 list-none p-0">
                                        {[
                                            'Create and manage your account',
                                            'Process orders and payments',
                                            'Communicate important updates related to your account',
                                            'Verify identity and maintain security',
                                            'Improve our services and user experience'
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4 p-2 text-slate-600 font-medium">
                                                <span className="text-teal-500 font-black">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="space-y-4 p-8 bg-teal-50 rounded-[32px] border border-teal-100">
                                    <h2 className="text-2xl font-black text-teal-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">3</span>
                                        Communication Policy
                                    </h2>
                                    <p className="text-teal-800/80 leading-relaxed font-medium">We send emails or messages only when necessary, including:</p>
                                    <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 mb-6">
                                        {[
                                            'Account creation confirmation',
                                            'One-Time Passwords (OTP)',
                                            'Password recovery',
                                            'Security verification'
                                        ].map((item, i) => (
                                            <li key={i} className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl text-teal-900 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-teal-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white rounded-2xl border border-teal-100 flex items-start gap-4">
                                            <div className="h-10 w-10 shrink-0 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                                <FaShieldAlt size={18} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                                We do not send promotional, spam, or unnecessary emails.
                                            </p>
                                        </div>
                                        <p className="text-sm text-teal-800/70 font-medium italic">
                                            If a website or app link is available, it may be included in important emails. If not available, the email will be sent without links.
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">4</span>
                                        Data Security
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        We take reasonable measures to protect your data from unauthorized access, misuse, or loss. Access to sensitive information is restricted and monitored.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">5</span>
                                        Data Sharing
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        We do not sell or rent your personal information to third parties. Data may be shared only when required by law or to provide core services.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">6</span>
                                        User Responsibility
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        Users are responsible for maintaining the confidentiality of their login credentials.
                                    </p>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm">7</span>
                                        Updates to Privacy Policy
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        We may update this policy from time to time. Continued use of the service means you accept the updated policy.
                                    </p>
                                </section>

                                <section className="pt-12 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900">Contact Information</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            If you have questions regarding this Privacy Policy, please contact SVPharma support at <span className="text-teal-600 font-bold">info@svpharma.in</span>.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
