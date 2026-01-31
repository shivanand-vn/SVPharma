import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaCloudUploadAlt, FaPlus, FaTimes } from 'react-icons/fa';

// Reuse Toast from ConnectionRequests (Ideally should be in components/Common)
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
                <p className="font-bold text-sm">{message}</p>
                <button onClick={onClose} className="ml-4 hover:opacity-70"><FaTimes /></button>
            </div>
        </div>
    );
};

const Inventory = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        company: '',
        category: 'Ethical',
        type: '',
        packing: '',
        mrp: '',
        trp: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const categories = ['Ethical', 'PCD', 'Generic', 'Other'];
    const types = ["Tablet", "Syrup", "Capsule", "Drops", "Pediatric Syrup",
        "Pediatric Drops & Suspentions", "Injection", "Soap",
        "Ointment/Cream", "Protein Powder", "Sachet", "Dental", "ENT"];

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCategorySelect = (cat: string) => {
        setFormData({ ...formData, category: cat });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final Frontend Validation
        const { name, description, company, mrp, trp, category, type, packing } = formData;
        if (!name || !description || !company || !mrp || !trp || !category || !type || !packing || !imageFile) {
            showToast("All fields and image are mandatory!", "error");
            return;
        }

        setLoading(true);
        try {
            // Construct FormData for single-step submission
            const submissionData = new FormData();
            submissionData.append('name', formData.name);
            submissionData.append('description', formData.description);
            submissionData.append('company', formData.company);
            submissionData.append('mrp', formData.mrp);
            submissionData.append('trp', formData.trp);
            submissionData.append('category', formData.category);
            submissionData.append('type', formData.type);
            submissionData.append('packing', formData.packing);
            if (imageFile) {
                submissionData.append('image', imageFile);
            }

            showToast("Saving medicine...", "success");
            await api.post('/medicines', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast("Medicine added successfully!", "success");

            // Reset Form
            setFormData({
                name: '',
                description: '',
                company: '',
                category: 'Ethical',
                type: '',
                packing: '',
                mrp: '',
                trp: ''
            });
            setImageFile(null);
            setImagePreview(null);

        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to add medicine", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-start min-h-full p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl border border-teal-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-700"></div>

                <h2 className="text-2xl font-bold text-teal-800 mb-8 text-center font-serif flex items-center justify-center gap-3">
                    <FaPlus className="text-sm opacity-50" /> Add New Medicine
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name & Company */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">Medicine Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g., Paracetamol"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="e.g., Sun Pharma"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">Description</label>
                            <input
                                type="text"
                                name="description"
                                placeholder="Composition or use case"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        {/* Categories */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-2 uppercase tracking-wider">Category</label>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => handleCategorySelect(cat)}
                                        className={`px-4 py-2 rounded-full border transition-all text-sm font-bold ${formData.category === cat
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-105'
                                            : 'bg-white text-gray-600 border-teal-200 hover:border-teal-400'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">Medicine Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white text-gray-700 font-medium cursor-pointer"
                                required
                            >
                                <option value="" disabled>Select Type</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Packing */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">Packing</label>
                            <input
                                type="text"
                                name="packing"
                                placeholder="10 Tablets"
                                value={formData.packing}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium"
                                required
                            />
                        </div>
                        {/* MRP */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">MRP (₹)</label>
                            <input
                                type="number"
                                name="mrp"
                                placeholder="0.00"
                                value={formData.mrp}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium no-spinner"
                                required
                            />
                        </div>
                        {/* TRP */}
                        <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1 uppercase tracking-wider">TRP (₹)</label>
                            <input
                                type="number"
                                name="trp"
                                placeholder="0.00"
                                value={formData.trp}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder-gray-400 bg-gray-50/50 font-medium no-spinner"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Image Upload & Submit Section */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 w-full space-y-4">
                                <label className="w-full cursor-pointer bg-teal-50 border-2 border-dashed border-teal-200 rounded-xl flex items-center justify-center gap-3 hover:bg-teal-100 transition-all group h-16">
                                    <FaCloudUploadAlt className="text-teal-400 group-hover:text-teal-600 transition-colors text-xl" />
                                    <span className="text-teal-600 font-bold">
                                        {imageFile ? "Change Medicine Image" : "Upload Medicine Image"}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Processing...' : <><FaPlus /> Add Medicine to Inventory</>}
                                </button>
                            </div>

                            <div className="w-full md:w-36 h-36 border-2 border-teal-500 rounded-2xl overflow-hidden shadow-lg bg-white p-1.5 flex-shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                ) : (
                                    <div className="w-full h-full border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        * All fields are mandatory and will be visible in the customer catalog
                    </p>
                </form>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Inventory;
