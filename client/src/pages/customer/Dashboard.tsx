import { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { FaPlus, FaMinus, FaAngleRight, FaSearch, FaTimes, FaChevronDown, FaBuilding } from 'react-icons/fa';

const MedicineSkeleton = ({ isCompact }: { isCompact?: boolean }) => (
    <div className={`bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-3 sm:p-5 flex flex-col h-full animate-pulse transition-all ${isCompact ? 'w-48 sm:w-64 flex-shrink-0' : 'w-full'}`}>
        <div className="h-28 sm:h-44 bg-gray-50 rounded-xl sm:rounded-2xl mb-4 sm:mb-6" />
        <div className="h-4 bg-gray-50 rounded-lg w-3/4 mb-2" />
        <div className="h-3 bg-gray-50 rounded-lg w-full mb-4" />
        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-end gap-4">
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-50 rounded-lg w-16" />
                <div className="h-2 bg-gray-50 rounded-lg w-12" />
            </div>
            <div className="h-8 w-10 bg-gray-50 rounded-xl" />
        </div>
    </div>
);

const MedicineDetailsModal = ({ med, onClose, cartItems, addToCart, updateQuantity }: any) => {
    if (!med) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 border border-white/20 custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100"
                >
                    <FaTimes />
                </button>

                <div className="p-1 bg-gradient-to-br from-teal-50 to-white">
                    <div className="h-64 bg-white rounded-[36px] flex items-center justify-center p-8 relative overflow-hidden border border-gray-100/50 shadow-inner">
                        <div className="absolute top-4 left-6">
                            <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-teal-100">
                                {med.category}
                            </span>
                        </div>
                        {med.imageUrl ? (
                            <img src={med.imageUrl} alt={med.name} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                        ) : (
                            <div className="text-6xl">💊</div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{med.name}</h2>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-teal-600">₹{med.trp || med.price}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Rate</span>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{med.company}</p>
                        <p className="text-xs font-medium text-gray-500">{med.packing} • {med.type}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-teal-500 rounded-full"></div>
                            Description
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {med.description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        {cartItems.find((i: any) => i._id === med._id) ? (
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Quantity in Cart</span>
                                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100">
                                    <button onClick={() => updateQuantity(med._id, -1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors"><FaMinus /></button>
                                    <span className="w-8 text-center font-black text-teal-600 text-lg">{cartItems.find((i: any) => i._id === med._id)?.quantity}</span>
                                    <button onClick={() => updateQuantity(med._id, 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors"><FaPlus /></button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => addToCart({ ...med, quantity: 1, price: med.trp || med.price })}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-teal-200 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FaPlus className="text-sm" /> Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MedicineCard = ({ med, cartItems, addToCart, updateQuantity, isCompact = false, hideOffers = false, onClick }: any) => (
    <div
        onClick={onClick}
        className={`group bg-white rounded-2xl md:rounded-3xl border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden ${isCompact ? 'w-48 sm:w-64 flex-shrink-0 p-3 sm:p-5 cursor-pointer' : 'p-3 sm:p-5'}`}
    >
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-[8px] font-black text-gray-400 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border border-gray-100">
                {med.category}
            </span>
        </div>

        {/* Company Badge (Top Left) - Added as per request */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-[8px] font-black text-teal-600 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border border-gray-100">
                {med.company || 'PCD'}
            </span>
        </div>

        <div className="h-28 sm:h-44 flex items-center justify-center mb-3 sm:mb-6 bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-50 relative overflow-hidden">
            {med.imageUrl ? (
                <img src={med.imageUrl} alt={med.name} className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110" />
            ) : (
                <div className="text-gray-200 text-4xl sm:text-6xl text-center">
                    <p className="text-[10px] font-bold text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-20 uppercase tracking-[0.5em]">{med.name}</p>
                    💊
                </div>
            )}
        </div>

        <div className="flex-1 flex flex-col">
            <h3 className="font-black text-gray-900 text-xs sm:text-lg leading-tight mb-1 truncate group-hover:text-primary transition-colors">{med.name}</h3>
            <p className="text-[9px] sm:text-[11px] text-gray-400 mb-2 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{med.description || 'Quality pharmaceutical product'}</p>

            <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-50">
                <div className="flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Net Rate:</span>
                            <span className="text-xs sm:text-xl font-black text-teal-600">₹{med.trp || med.price}</span>
                        </div>
                        {!hideOffers && (
                            <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold">
                                M.R.P: <span className="line-through">₹{med.mrp}</span>
                            </p>
                        )}
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        {cartItems.find((i: any) => i._id === med._id) ? (
                            <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm scale-90 sm:scale-100 origin-right">
                                <button onClick={() => updateQuantity(med._id, -1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-colors border-r border-gray-100"><FaMinus size={10} /></button>
                                <span className="w-8 sm:w-10 text-center font-black text-primary text-[10px] sm:text-sm">{cartItems.find((i: any) => i._id === med._id)?.quantity}</span>
                                <button onClick={() => updateQuantity(med._id, 1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-colors border-l border-gray-100"><FaPlus size={10} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => addToCart({ ...med, quantity: 1, price: med.trp || med.price })}
                                className="bg-primary hover:bg-teal-700 text-white w-10 sm:w-12 h-8 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 transition-all hover:-translate-y-1 active:scale-95 font-bold text-[10px] sm:text-xs"
                            >
                                Add
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CustomerDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [fastMoving, setFastMoving] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart, cartItems, updateQuantity } = useCart();

    const [activeTab, setActiveTab] = useState('All');
    const [activeType, setActiveType] = useState('All Types');
    const [selectedCompany, setSelectedCompany] = useState('All Companies');
    const [allCompanies, setAllCompanies] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const companyRef = useRef<HTMLDivElement>(null);

    // Close company dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollProgress(progress);
        }
    };

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                // Fetch Medicines with company filter
                const url = selectedCompany === 'All Companies'
                    ? '/medicines'
                    : `/medicines?company=${encodeURIComponent(selectedCompany)}`;
                const { data } = await api.get(url);
                setMedicines(data);
                // Fetch Fast Moving via Real Backend Logic
                const { data: fastMovingData } = await api.get('/medicines/fast-moving');
                setFastMoving(fastMovingData);


                // Populate companies list only on initial load (when showing All)
                // This ensures the dropdown options don't disappear when filtering
                if (selectedCompany === 'All Companies') {
                    const uniqueCompanies = Array.from(new Set(data.map((m: any) => m.company))).filter(Boolean) as string[];
                    setAllCompanies(['All Companies', ...uniqueCompanies]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchMedicines();
    }, [selectedCompany]);

    const categories = ['All Types', 'Tablet', 'Syrup', 'Capsule', 'Drops', 'Pediatric Syrup', 'Pediatric Drops & Suspentions', 'Injection', 'Soap', 'Ointment/Cream', 'Protein Powder', 'Sachet', 'Dental', 'ENT'];
    const tabs = ['All', 'PCD', 'Generic', 'Ethical', 'Other'];

    const filteredMedicines = medicines.filter((med: any) => {
        const matchesCategory = activeTab === 'All' || med.category === activeTab;
        const matchesType = activeType === 'All Types' || med.type === activeType;
        const matchesCompany = selectedCompany === 'All Companies' || med.company === selectedCompany;
        const matchesSearch = !searchQuery ||
            med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesCompany && matchesSearch;
    });

    // NO CLIENT SIDE SLICE for fastMoving anymore
    // const fastMoving = medicines.slice(0, 6);

    return (
        <div className="min-h-screen w-full py-6 md:py-8 bg-[#ebf5f3] relative overflow-hidden">
            <div className="w-full px-4 md:px-8 space-y-6 relative z-10">
                {/* Horizontal Category Tabs & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-teal-100/30">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeTab === tab
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-teal-900/10'
                                    : 'bg-white border-white text-gray-400 hover:bg-teal-50 shadow-sm'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search medicine or description..."
                            className="w-full bg-white border border-gray-100 rounded-[20px] pl-11 pr-4 py-3 text-[11px] font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm placeholder:text-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Horizontal Type Pills & Company Filter */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center py-2 border-y border-teal-100/30">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto">
                        {categories.map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`whitespace-nowrap text-[11px] font-bold uppercase tracking-widest transition-all px-2 py-1 rounded-lg ${activeType === type
                                    ? 'text-orange-500 bg-orange-50'
                                    : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-auto" ref={companyRef}>
                        <button
                            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                            className="w-full sm:min-w-[200px] flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-teal-50 rounded-xl shadow-sm hover:border-teal-200 transition-all text-left"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <FaBuilding className="text-teal-500 flex-shrink-0" size={14} />
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 truncate">
                                    {selectedCompany}
                                </span>
                            </div>
                            <FaChevronDown className={`text-gray-300 transition-transform duration-300 ${isCompanyOpen ? 'rotate-180' : ''}`} size={10} />
                        </button>

                        {isCompanyOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full sm:w-[240px] bg-white rounded-2xl shadow-2xl shadow-teal-900/10 border border-teal-50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                                    {allCompanies.map(company => (
                                        <button
                                            key={company}
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                setIsCompanyOpen(false);
                                            }}
                                            className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-l-4 ${selectedCompany === company
                                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                                }`}
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fast Moving Section - Hidden when searching */}
                {!searchQuery && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-gray-800 font-serif">Fast Moving</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Most popular medicines in demand</p>
                            </div>
                            <button className="flex items-center gap-1 text-[11px] font-black text-teal-600 uppercase tracking-widest group">
                                View All <FaAngleRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex gap-4 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
                        >
                            {loading ? (
                                [...Array(4)].map((_, i) => <MedicineSkeleton key={i} isCompact={true} />)
                            ) : (
                                fastMoving.map((med: any) => (
                                    <MedicineCard
                                        key={med._id}
                                        med={med}
                                        cartItems={cartItems}
                                        addToCart={addToCart}
                                        updateQuantity={updateQuantity}
                                        isCompact={true}
                                        hideOffers={true}
                                        onClick={() => setSelectedMedicine(med)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Scroll Progress Bar Animation */}
                        <div className="flex justify-center mt-4">
                            <div className="w-24 h-1 bg-gray-200/50 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                    style={{
                                        width: '40%',
                                        transform: `translateX(${(scrollProgress / 100) * 150}%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* All Medicines Grid */}
                <div className="space-y-4 pt-4">
                    <div className="px-1">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-800 font-serif">All Medicines</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Browse our complete inventory</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                            {[...Array(10)].map((_, i) => <MedicineSkeleton key={i} />)}
                        </div>
                    ) : filteredMedicines.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                            {filteredMedicines.map((med: any) => (
                                <MedicineCard
                                    key={med._id}
                                    med={med}
                                    cartItems={cartItems}
                                    addToCart={addToCart}
                                    updateQuantity={updateQuantity}
                                    onClick={() => setSelectedMedicine(med)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <h3 className="text-lg font-black text-gray-400 uppercase tracking-[0.2em]">No Matches Found</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Medicine Details Modal */}
            {selectedMedicine && (
                <MedicineDetailsModal
                    med={selectedMedicine}
                    onClose={() => setSelectedMedicine(null)}
                    cartItems={cartItems}
                    addToCart={addToCart}
                    updateQuantity={updateQuantity}
                />
            )}
        </div>
    );
};

export default CustomerDashboard;
