import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    FaChartLine, FaUsers, FaBox, FaCreditCard, FaFilePdf, FaFileExcel, 
    FaCalendarAlt, FaSearch, FaFilter, FaBriefcase, FaChevronDown, FaExclamationTriangle 
} from 'react-icons/fa';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { ExportHelper, type CompanyInfo } from '../../utils/exportHelper';

const MOCK_PURCHASES = [
    { purchaseId: 'PUR-847291', vendor: 'Sun Pharma Distributors', date: '2026-05-18', itemsCount: 14, total: 42800, status: 'Completed' },
    { purchaseId: 'PUR-738291', vendor: 'Zydus Lifesciences', date: '2026-05-22', itemsCount: 6, total: 18500, status: 'Completed' },
    { purchaseId: 'PUR-629104', vendor: 'Lupin Laboratories', date: '2026-05-26', itemsCount: 22, total: 84300, status: 'Pending Delivery' },
    { purchaseId: 'PUR-510294', vendor: 'Reddy\'s Lab Supply', date: '2026-05-28', itemsCount: 9, total: 24600, status: 'Completed' }
];

const Reports: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'sales';
    const { showNotification } = useNotification();

    // Data lists from API
    const [orders, setOrders] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanyInfo | undefined>(undefined);

    // Global loading states
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Dynamic Filter settings
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subReportType, setSubReportType] = useState('');
    const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

    // Preload system settings & transactional details
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [
                    { data: ordersData },
                    { data: paymentsData },
                    { data: medicinesData },
                    { data: customersData },
                    { data: settingsData }
                ] = await Promise.all([
                    api.get('/orders'),
                    api.get('/payments/admin'),
                    api.get('/medicines'),
                    api.get('/admin/customers'),
                    api.get('/settings')
                ]);

                setOrders(ordersData || []);
                setPayments(paymentsData || []);
                setMedicines(medicinesData || []);
                setCustomers(customersData || []);

                if (settingsData) {
                    setCompanySettings({
                        name: settingsData.appName,
                        email: settingsData.email,
                        phone: settingsData.phone || (settingsData.contacts?.[0]?.phone || ''),
                        address: settingsData.address 
                            ? `${settingsData.address.line1 || ''}, ${settingsData.address.city || ''}, ${settingsData.address.state || ''} - ${settingsData.address.pincode || ''}`
                            : 'Karnataka, India'
                    });
                }
            } catch (error) {
                console.error('Failed to load reports base records', error);
                showNotification('Error retrieving real-time pharmacy records', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [showNotification]);

    // Whenever activeTab changes, reset sub-report filters
    useEffect(() => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setStartDate('');
        setEndDate('');
        setReportDropdownOpen(false);
        setClientDropdownOpen(false);
        
        // Define sub-report defaults based on tab selection
        if (activeTab === 'sales') setSubReportType('summary');
        else if (activeTab === 'customers') setSubReportType('customers-list');
        else if (activeTab === 'payments') setSubReportType('billing');
        else if (activeTab === 'orders') setSubReportType('total');
        else if (activeTab === 'revenue') setSubReportType('profit-analysis');
    }, [activeTab]);

    // Match search term helper
    const matchesSearch = (text: string, query: string) => {
        if (!text) return false;
        return text.toLowerCase().includes(query.toLowerCase());
    };

    // Filtered data sets computed dynamically based on current filter states
    const processedReportData = useMemo(() => {
        // --- 1. SALES TAB PROCESSING ---
        if (activeTab === 'sales') {
            let list = [...orders];

            // Date filtering
            if (startDate) {
                list = list.filter(o => new Date(o.createdAt) >= new Date(startDate));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                list = list.filter(o => new Date(o.createdAt) <= end);
            }

            // Status filtering
            if (statusFilter !== 'all') {
                list = list.filter(o => o.status === statusFilter);
            }

            // Search filter
            if (searchQuery) {
                list = list.filter(o => 
                    matchesSearch(o._id, searchQuery) ||
                    matchesSearch(o.customer?.name, searchQuery) ||
                    matchesSearch(o.customer?.address?.shopName, searchQuery)
                );
            }

            // Sub-report type specific formatting
            if (subReportType === 'daily') {
                // Group sales by Day
                const dayGroups: Record<string, { date: string, ordersCount: number, revenue: number, walletUsed: number }> = {};
                list.forEach(o => {
                    if (o.status === 'cancelled') return;
                    const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN');
                    if (!dayGroups[dateStr]) {
                        dayGroups[dateStr] = { date: dateStr, ordersCount: 0, revenue: 0, walletUsed: 0 };
                    }
                    dayGroups[dateStr].ordersCount += 1;
                    dayGroups[dateStr].revenue += o.totalPrice || 0;
                    dayGroups[dateStr].walletUsed += o.walletAmountUsed || 0;
                });
                return Object.values(dayGroups);
            }

            if (subReportType === 'monthly') {
                // Group sales by Month
                const monthGroups: Record<string, { month: string, ordersCount: number, revenue: number }> = {};
                list.forEach(o => {
                    if (o.status === 'cancelled') return;
                    const dateObj = new Date(o.createdAt);
                    const monthStr = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                    if (!monthGroups[monthStr]) {
                        monthGroups[monthStr] = { month: monthStr, ordersCount: 0, revenue: 0 };
                    }
                    monthGroups[monthStr].ordersCount += 1;
                    monthGroups[monthStr].revenue += o.totalPrice || 0;
                });
                return Object.values(monthGroups);
            }

            if (subReportType === 'yearly') {
                // Group sales by Year
                const yearGroups: Record<string, { year: string, ordersCount: number, revenue: number }> = {};
                list.forEach(o => {
                    if (o.status === 'cancelled') return;
                    const yearStr = new Date(o.createdAt).getFullYear().toString();
                    if (!yearGroups[yearStr]) {
                        yearGroups[yearStr] = { year: yearStr, ordersCount: 0, revenue: 0 };
                    }
                    yearGroups[yearStr].ordersCount += 1;
                    yearGroups[yearStr].revenue += o.totalPrice || 0;
                });
                return Object.values(yearGroups);
            }

            return list; // Standard sales summary
        }

        // --- 2. CUSTOMERS & PEOPLE ROSTER TAB PROCESSING ---
        if (activeTab === 'customers') {
            let list = [...customers];
            if (searchQuery) {
                list = list.filter(c => 
                    matchesSearch(c.name, searchQuery) ||
                    matchesSearch(c.phone, searchQuery) ||
                    matchesSearch(c.address?.shopName, searchQuery) ||
                    matchesSearch(c.address?.city, searchQuery)
                );
            }
            if (categoryFilter !== 'all') {
                list = list.filter(c => c.type === categoryFilter);
            }
            return list;
        }

        // --- 4. TRANSACTIONS TAB PROCESSING ---
        if (activeTab === 'payments') {
            if (subReportType === 'pending-payments') {
                const customerMap: Record<string, { 
                    id: string, 
                    name: string, 
                    email: string, 
                    phone: string, 
                    totalAmount: number, 
                    pendingAmount: number 
                }> = {};

                customers.forEach(c => {
                    customerMap[c._id] = {
                        id: c._id,
                        name: c.name,
                        email: c.email || 'N/A',
                        phone: c.phone || 'N/A',
                        totalAmount: 0,
                        pendingAmount: 0
                    };
                });

                orders.forEach(o => {
                    const custId = o.customer?._id || o.customer;
                    if (!custId) return;
                    
                    if (!customerMap[custId]) {
                        customerMap[custId] = {
                            id: custId,
                            name: o.customer?.name || 'Retail Client',
                            email: o.customer?.email || 'N/A',
                            phone: o.customer?.phone || 'N/A',
                            totalAmount: 0,
                            pendingAmount: 0
                        };
                    }

                    if (o.status !== 'cancelled') {
                        // Apply date filters if provided
                        if (startDate && new Date(o.createdAt) < new Date(startDate)) return;
                        if (endDate) {
                            const end = new Date(endDate);
                            end.setHours(23, 59, 59, 999);
                            if (new Date(o.createdAt) > end) return;
                        }
                        
                        customerMap[custId].totalAmount += o.totalPrice || 0;
                        if (o.paymentStatus === 'pending') {
                            customerMap[custId].pendingAmount += o.totalPrice || 0;
                        }
                    }
                });

                let list = Object.values(customerMap).filter(c => c.pendingAmount > 0);

                if (searchQuery) {
                    list = list.filter(c => 
                        matchesSearch(c.name, searchQuery) ||
                        matchesSearch(c.email, searchQuery) ||
                        matchesSearch(c.phone, searchQuery)
                    );
                }
                
                list.sort((a, b) => a.name.localeCompare(b.name));
                return list;
            }

            let list = [...payments];

            // Date filtering
            if (startDate) {
                list = list.filter(p => new Date(p.createdAt) >= new Date(startDate));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                list = list.filter(p => new Date(p.createdAt) <= end);
            }

            if (searchQuery) {
                list = list.filter(p => 
                    matchesSearch(p.customer?.name, searchQuery) ||
                    matchesSearch(p.transactionId, searchQuery)
                );
            }

            if (subReportType === 'awaiting-approval') {
                return list.filter(p => p.status === 'pending');
            }

            return list; // Billing (All Payments)
        }

        // --- 5. ORDERS TAB PROCESSING ---
        if (activeTab === 'orders') {
            if (subReportType === 'purchase') {
                let list = [...MOCK_PURCHASES];
                if (searchQuery) {
                    list = list.filter(p => 
                        matchesSearch(p.purchaseId, searchQuery) ||
                        matchesSearch(p.vendor, searchQuery)
                    );
                }
                return list;
            }

            let list = [...orders];

            // Apply date filters if provided
            if (startDate) {
                list = list.filter(o => new Date(o.createdAt) >= new Date(startDate));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                list = list.filter(o => new Date(o.createdAt) <= end);
            }

            // Apply search query filter
            if (searchQuery) {
                list = list.filter(o => 
                    matchesSearch(o.customer?.name, searchQuery) ||
                    matchesSearch(o._id, searchQuery)
                );
            }

            // Apply sub-report filters
            if (subReportType === 'pending' || subReportType === 'pending-orders') {
                return list.filter(o => o.status === 'pending');
            } else if (subReportType === 'processing') {
                return list.filter(o => o.status === 'processing');
            } else if (subReportType === 'shipped') {
                return list.filter(o => o.status === 'shipped');
            } else if (subReportType === 'delivered') {
                return list.filter(o => o.status === 'delivered');
            } else if (subReportType === 'cancelled') {
                return list.filter(o => o.status === 'cancelled');
            }
            
            return list; // Total Orders
        }

        // --- 6. REVENUE & PROFIT TAB PROCESSING ---
        if (activeTab === 'revenue') {
            let list = orders.filter(o => o.status === 'delivered');

            if (startDate) {
                list = list.filter(o => new Date(o.createdAt) >= new Date(startDate));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                list = list.filter(o => new Date(o.createdAt) <= end);
            }

            if (subReportType === 'revenue-list') {
                return list;
            }

            if (subReportType === 'profit-analysis') {
                // Aggregate sales by individual items to analyze profit margins
                const itemLedger: Record<string, { name: string, company: string, qty: number, totalRev: number, totalCost: number }> = {};
                list.forEach(o => {
                    o.items.forEach((item: any) => {
                        const key = item.medicine || item.name;
                        if (!itemLedger[key]) {
                            // Find base medicine cost or fallback to 60% MRP if not populated
                            const medRef = medicines.find(m => m._id === item.medicine);
                            const unitCost = medRef ? (medRef.cost || medRef.price || 0) : (item.price * 0.65);
                            itemLedger[key] = {
                                name: item.name,
                                company: medRef?.company || 'SV Distribution',
                                qty: 0,
                                totalRev: 0,
                                totalCost: 0
                            };
                            itemLedger[key].totalCost = unitCost;
                        }
                        itemLedger[key].qty += item.quantity;
                        itemLedger[key].totalRev += (item.price * item.quantity);
                    });
                });

                // Compute profit margins
                return Object.values(itemLedger).map(item => {
                    const costTotal = Math.round((item.totalCost * item.qty) * 100) / 100;
                    const profitTotal = Math.round((item.totalRev - costTotal) * 100) / 100;
                    const margin = item.totalRev > 0 ? Math.round((profitTotal / item.totalRev) * 100) : 0;
                    return {
                        name: item.name,
                        company: item.company,
                        qty: item.qty,
                        revenue: item.totalRev,
                        cost: costTotal,
                        profit: profitTotal,
                        margin: `${margin}%`
                    };
                });
            }
        }

        return [];
    }, [activeTab, orders, payments, medicines, customers, subReportType, startDate, endDate, searchQuery, statusFilter, categoryFilter]);

    // Handle File Export Generation
    const triggerExport = async (format: 'pdf' | 'excel') => {
        if (processedReportData.length === 0) {
            showNotification('No filtered records available to generate export', 'warning');
            return;
        }

        setExportLoading(true);
        
        try {
            let title = '';
            let headers: string[] = [];
            let rows: any[][] = [];
            let fileName = '';

            // Formulate headers & map objects to arrays based on activeTab and subReportType
            if (activeTab === 'sales') {
                fileName = `Sales_${subReportType}_Report`;
                if (subReportType === 'daily') {
                    title = 'Daily Sales Summary Report';
                    headers = ['Date', 'Orders Completed', 'Gross Earnings (₹)', 'Wallet Amount Used (₹)'];
                    rows = processedReportData.map((d: any) => [d.date, d.ordersCount, `₹${d.revenue.toFixed(2)}`, `₹${d.walletUsed.toFixed(2)}`]);
                } else if (subReportType === 'monthly') {
                    title = 'Monthly Sales Aggregation Report';
                    headers = ['Month', 'Orders Count', 'Total Income (₹)'];
                    rows = processedReportData.map((d: any) => [d.month, d.ordersCount, `₹${d.revenue.toFixed(2)}`]);
                } else if (subReportType === 'yearly') {
                    title = 'Yearly Sales Aggregation Report';
                    headers = ['Year', 'Total Orders', 'Total Net Income (₹)'];
                    rows = processedReportData.map((d: any) => [d.year, d.ordersCount, `₹${d.revenue.toFixed(2)}`]);
                } else {
                    title = 'Sales Operations Transaction Summary';
                    headers = ['Order ID', 'Outlet Client', 'Date', 'Total Value', 'Status', 'Payment Status'];
                    rows = processedReportData.map((o: any) => [
                        o._id.slice(-8).toUpperCase(),
                        o.customer?.name || 'Retail Customer',
                        new Date(o.createdAt).toLocaleDateString('en-IN'),
                        `₹${o.totalPrice.toFixed(2)}`,
                        o.status.toUpperCase(),
                        o.paymentStatus.toUpperCase()
                    ]);
                }
            } else if (activeTab === 'customers') {
                fileName = 'Customers_Roster_Export';
                title = 'Retail Customer & Pharmacy Roster';
                headers = ['Client Name', 'Phone', 'Shop Name', 'City', 'Licence Type', 'Outstanding Dues'];
                rows = processedReportData.map((c: any) => [
                    c.name, c.phone, c.address?.shopName || 'N/A', c.address?.city, c.type, `₹${c.pendingBalance.toFixed(2)}`
                ]);
            } else if (activeTab === 'payments') {
                fileName = `${subReportType}_Ledger`;
                if (subReportType === 'pending-payments') {
                    title = 'Outstanding Customer Dues Ledger';
                    headers = ['Client Name', 'Email Address', 'Phone / Contact', 'Total Purchases', 'Pending Dues'];
                    rows = processedReportData.map((c: any) => [
                        c.name,
                        c.email,
                        c.phone,
                        `₹${c.totalAmount.toFixed(2)}`,
                        `₹${c.pendingAmount.toFixed(2)}`
                    ]);
                } else {
                    title = subReportType === 'awaiting-approval' ? 'Payments Awaiting Approval Ledger' : 'Billing Transactions Ledger';
                    headers = ['Payment ID', 'Client Name', 'Paid Amount', 'Date', 'Method', 'Transaction Ref', 'Audit Status'];
                    rows = processedReportData.map((p: any) => [
                        p._id.slice(-8).toUpperCase(),
                        p.customer?.name || 'Retail Client',
                        `₹${p.amount.toFixed(2)}`,
                        new Date(p.createdAt).toLocaleDateString('en-IN'),
                        p.paymentMethod,
                        p.transactionId || 'CASH RECORD',
                        p.status.toUpperCase()
                    ]);
                }
            } else if (activeTab === 'orders') {
                fileName = `${subReportType}_Ledger`;
                if (subReportType === 'purchase') {
                    title = 'Stock Purchase Acquisition Register';
                    headers = ['Purchase Invoice', 'Medical Supplier', 'Date', 'Total Restocked Items', 'Total Value', 'Status'];
                    rows = processedReportData.map((p: any) => [
                        p.purchaseId, p.vendor, p.date, p.itemsCount, `₹${p.total.toLocaleString()}`, p.status
                    ]);
                } else {
                    title = `${subReportType.charAt(0).toUpperCase() + subReportType.slice(1)} Orders Log`;
                    headers = ['Order ID', 'Outlet Client', 'Total Value', 'Date', 'Fulfillment Status'];
                    rows = processedReportData.map((o: any) => [
                        o._id.slice(-8).toUpperCase(),
                        o.customer?.name || 'Retail Customer',
                        `₹${o.totalPrice.toFixed(2)}`,
                        new Date(o.createdAt).toLocaleDateString('en-IN'),
                        o.status.toUpperCase()
                    ]);
                }
            } else if (activeTab === 'revenue') {
                fileName = `${subReportType}_Ledger`;
                if (subReportType === 'revenue-list') {
                    title = 'Pharmacy Sales Revenue Ledger';
                    headers = ['Invoice ID', 'Outlet Client', 'Order Value', 'Fulfillment Date', 'Payment Status'];
                    rows = processedReportData.map((r: any) => [
                        r._id.slice(-8).toUpperCase(),
                        r.customer?.name || 'Retailer Client',
                        `₹${r.totalPrice.toFixed(2)}`,
                        new Date(r.updatedAt).toLocaleDateString('en-IN'),
                        r.paymentStatus.toUpperCase()
                    ]);
                } else {
                    title = 'Stock Profit Margin & Efficiency Ledger';
                    headers = ['Medicine Brand', 'Manufacturer', 'Qty Dispatched', 'Accumulated Gross Rev', 'Acquisition Cost', 'Net Profits', 'Gross Margins'];
                    rows = processedReportData.map((p: any) => [
                        p.name, p.company, p.qty, `₹${p.revenue.toFixed(2)}`, `₹${p.cost.toFixed(2)}`, `₹${p.profit.toFixed(2)}`, p.margin
                    ]);
                }
            }

            // Fire corresponding export engine
            if (format === 'pdf') {
                await ExportHelper.exportToPDF({ title, headers, rows, fileName, companyInfo: companySettings });
            } else {
                ExportHelper.exportToExcel({ title, headers, rows, fileName, companyInfo: companySettings });
            }

            showNotification(`${format.toUpperCase()} Exported successfully!`, 'success');
        } catch (error) {
            console.error('Export run error', error);
            showNotification('Error generating report files', 'error');
        } finally {
            setExportLoading(false);
        }
    };

    const subReportOptionsMap: Record<string, { value: string, label: string }[]> = {
        sales: [
            { value: 'summary', label: 'Sales Orders Summary' },
            { value: 'daily', label: 'Daily Aggregation' },
            { value: 'monthly', label: 'Monthly Aggregation' },
            { value: 'yearly', label: 'Yearly Aggregation' }
        ],
        payments: [
            { value: 'billing', label: 'All Bill Transactions' },
            { value: 'awaiting-approval', label: 'Awaiting Approval' },
            { value: 'pending-payments', label: 'Pending Payments' }
        ],
        orders: [
            { value: 'total', label: 'Total Orders' },
            { value: 'pending', label: 'Pending Orders' },
            { value: 'processing', label: 'Processing Orders' },
            { value: 'shipped', label: 'Shipped Orders' },
            { value: 'delivered', label: 'Delivered Orders' },
            { value: 'cancelled', label: 'Cancelled Orders' },
            { value: 'purchase', label: 'Acquisitions Ledger' }
        ],
        revenue: [
            { value: 'revenue-list', label: 'Sales Revenue Ledger' },
            { value: 'profit-analysis', label: 'Profit Margin Ledger' }
        ]
    };

    const currentOptions = subReportOptionsMap[activeTab] || [];
    const activeOption = currentOptions.find(opt => opt.value === subReportType) || currentOptions[0] || { value: '', label: '' };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-teal-50 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-teal-900 font-sans tracking-tight">Pharmacy Business Reports</h2>
                    <p className="text-xs text-teal-600 font-extrabold uppercase tracking-widest mt-1">
                        Export structured PDFs and Excel sheets of dynamic pharmacy operations
                    </p>
                </div>
                
                {/* Actions download */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => triggerExport('pdf')}
                        disabled={exportLoading || processedReportData.length === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                        <FaFilePdf size={14} /> Export PDF
                    </button>
                    <button
                        onClick={() => triggerExport('excel')}
                        disabled={exportLoading || processedReportData.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                        <FaFileExcel size={14} /> Export Excel
                    </button>
                </div>
            </div>

            {/* Tab Navigation Bar */}
            <div className="bg-white rounded-3xl p-2 border border-teal-50 shadow-md flex flex-wrap gap-1.5">
                {[
                    { tab: 'sales', label: 'Sales & Revenue', icon: <FaChartLine /> },
                    { tab: 'customers', label: 'People & Roster', icon: <FaUsers /> },
                    { tab: 'payments', label: 'Transactions', icon: <FaCreditCard /> },
                    { tab: 'orders', label: 'Orders', icon: <FaBox /> },
                    { tab: 'revenue', label: 'Profit Analysis', icon: <FaBriefcase /> },
                ].map((t) => (
                    <button
                        key={t.tab}
                        onClick={() => setSearchParams({ tab: t.tab })}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                            activeTab === t.tab
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700'
                        }`}
                    >
                        <span className="text-sm">{t.icon}</span>
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-3xl p-6 border border-teal-50 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-teal-800 font-black text-xs uppercase tracking-widest pb-3 border-b border-gray-100">
                    <FaFilter /> Filters & Report Parameters
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Sub Report Type select */}
                    {activeTab !== 'customers' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Report Type</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-teal-200 outline-none text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all bg-white"
                                >
                                    <span>{activeOption.label || 'Select Report Type'}</span>
                                    <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${reportDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {reportDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setReportDropdownOpen(false)}></div>
                                        <div className="absolute left-0 right-0 mt-2 z-30 bg-white rounded-2xl border border-teal-50 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                                            {currentOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSubReportType(opt.value);
                                                        setReportDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                                                        subReportType === opt.value
                                                            ? 'bg-teal-50 text-teal-700'
                                                            : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Search query input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">General Query Search</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20"
                            />
                        </div>
                    </div>

                    {/* Date Pickers for applicable tabs */}
                    {['sales', 'payments', 'orders', 'revenue'].includes(activeTab) ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Optionals for Lists filters */}
                            {activeTab === 'customers' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Type</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-teal-200 outline-none text-xs font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all bg-white"
                                        >
                                            <span>
                                                {categoryFilter === 'all' ? 'All' :
                                                 categoryFilter === 'Doctor' ? 'Doctor' : 'Medical'}
                                            </span>
                                            <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${clientDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {clientDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-20" onClick={() => setClientDropdownOpen(false)}></div>
                                                <div className="absolute left-0 right-0 mt-2 z-30 bg-white rounded-2xl border border-teal-50 shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {[
                                                        { value: 'all', label: 'All' },
                                                        { value: 'Doctor', label: 'Doctor' },
                                                        { value: 'Medical', label: 'Medical' }
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setCategoryFilter(opt.value);
                                                                setClientDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                                                                categoryFilter === opt.value
                                                                    ? 'bg-teal-50 text-teal-700'
                                                                    : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Preview Live Data Table */}
            <div className="bg-white rounded-3xl border border-teal-50 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-teal-50/10">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                        <h3 className="font-black text-teal-900 text-sm uppercase tracking-wider">Report Preview Ledger</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                        {processedReportData.length} records matching filters
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                    {loading ? (
                        <div className="p-20 text-center text-teal-600 font-bold space-y-3">
                            <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-xs uppercase tracking-widest">Syncing active ledger records...</p>
                        </div>
                    ) : processedReportData.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-[#f8fafc] sticky top-0 z-10">
                                <tr>
                                    {/* HEADERS GENERATED DYNAMICALLY */}
                                    {activeTab === 'sales' && (
                                        subReportType === 'daily' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders Count</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Income</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wallet Credits</th>
                                            </>
                                        ) : subReportType === 'monthly' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders Count</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</th>
                                            </>
                                        ) : subReportType === 'yearly' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders Count</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outlet Name</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Date</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Value</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fulfillment</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill Due</th>
                                            </>
                                        )
                                    )}

                                    {activeTab === 'customers' && (
                                        <>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shop Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Licence Type</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outstanding Dues</th>
                                        </>
                                    )}

                                    {activeTab === 'payments' && (
                                        subReportType === 'pending-payments' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Name</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone / Contact</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Purchases</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Dues</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment ID</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Name</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid Amount</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Ref</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audit Status</th>
                                            </>
                                        )
                                    )}

                                    {activeTab === 'orders' && (
                                        subReportType !== 'purchase' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outlet Client</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Value</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Created</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acquisition ID</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Supplier</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Restocked</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items count</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total cost</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            </>
                                        )
                                    )}

                                    {activeTab === 'revenue' && (
                                        subReportType === 'revenue-list' ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice ID</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outlet Client</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Value</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fulfillment Date</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Name</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manufacturer</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dispatched</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purchase Cost</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Profits</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">G.Margins</th>
                                            </>
                                        )
                                    )}
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-gray-100 font-medium text-xs text-gray-700">
                                {processedReportData.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-teal-50/10 transition-colors">
                                        {activeTab === 'sales' && (
                                            subReportType === 'daily' ? (
                                                <>
                                                    <td className="px-6 py-3.5 text-gray-800 font-bold">{row.date}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600">{row.ordersCount}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.revenue.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-right font-bold text-teal-600">₹{row.walletUsed.toFixed(2)}</td>
                                                </>
                                            ) : subReportType === 'monthly' ? (
                                                <>
                                                    <td className="px-6 py-3.5 text-gray-800 font-bold">{row.month}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600">{row.ordersCount}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.revenue.toFixed(2)}</td>
                                                </>
                                            ) : subReportType === 'yearly' ? (
                                                <>
                                                    <td className="px-6 py-3.5 text-gray-800 font-bold">{row.year}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600">{row.ordersCount}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.revenue.toFixed(2)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3.5 text-teal-700 font-bold">#{row._id.slice(-8).toUpperCase()}</td>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.customer?.name}</td>
                                                    <td className="px-6 py-3.5 text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.totalPrice.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                            row.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                                            row.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                                        }`}>{row.status}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                            row.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}>{row.paymentStatus}</span>
                                                    </td>
                                                </>
                                            )
                                        )}

                                        {activeTab === 'customers' && (
                                            <>
                                                <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                                                <td className="px-6 py-3.5 text-gray-600 font-bold">{row.phone}</td>
                                                <td className="px-6 py-3.5 text-gray-500 font-bold">{row.address?.shopName || 'N/A'}</td>
                                                <td className="px-6 py-3.5 text-gray-600">{row.address?.city}</td>
                                                <td className="px-6 py-3.5 text-center font-bold text-teal-600">{row.type}</td>
                                                <td className="px-6 py-3.5 text-right font-black text-red-600">₹{row.pendingBalance.toFixed(2)}</td>
                                            </>
                                        )}

                                        {activeTab === 'payments' && (
                                            subReportType === 'pending-payments' ? (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                                                    <td className="px-6 py-3.5 text-gray-600">{row.email}</td>
                                                    <td className="px-6 py-3.5 text-gray-600 font-bold">{row.phone}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.totalAmount.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-red-600">₹{row.pendingAmount.toFixed(2)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-teal-700">#{row._id.slice(-8).toUpperCase()}</td>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.customer?.name}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td className="px-6 py-3.5 text-center font-bold text-teal-600">{row.paymentMethod}</td>
                                                    <td className="px-6 py-3.5 text-gray-600 font-mono text-[10px] font-bold">{row.transactionId || 'CASH'}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                            row.status === 'approved' ? 'bg-green-50 text-green-700' :
                                                            row.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                                        }`}>{row.status}</span>
                                                    </td>
                                                </>
                                            )
                                        )}

                                        {activeTab === 'orders' && (
                                            subReportType !== 'purchase' ? (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-teal-700">#{row._id.slice(-8).toUpperCase()}</td>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.customer?.name}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.totalPrice.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                                            row.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                            row.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                                                            row.status === 'shipped' ? 'bg-indigo-50 text-indigo-700' :
                                                            row.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}>{row.status}</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-teal-700">{row.purchaseId}</td>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.vendor}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-500">{row.date}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600 font-bold">{row.itemsCount} items</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.total.toLocaleString()}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                            row.status.includes('Pending') ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-green-50 text-green-700'
                                                        }`}>{row.status}</span>
                                                    </td>
                                                </>
                                            )
                                        )}

                                        {activeTab === 'revenue' && (
                                            subReportType === 'revenue-list' ? (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-teal-700">#{row._id.slice(-8).toUpperCase()}</td>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.customer?.name}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.totalPrice.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-gray-500">{new Date(row.updatedAt).toLocaleDateString('en-IN')}</td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[9px] font-black uppercase">{row.paymentStatus}</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                                                    <td className="px-6 py-3.5 text-gray-500">{row.company}</td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600 font-bold">{row.qty}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-teal-700">₹{row.revenue.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-right font-bold text-gray-600">₹{row.cost.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-right font-black text-green-700">₹{row.profit.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-center font-black text-teal-600">{row.margin}</td>
                                                </>
                                            )
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 text-center text-gray-400 italic space-y-2">
                            <FaExclamationTriangle className="text-3xl text-amber-500/80 mx-auto animate-bounce mb-3" />
                            <p className="text-xs font-bold uppercase tracking-wider">No matching records found</p>
                            <p className="text-[11px] text-gray-300">Try modifying your filtering queries or date ranges</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Exporting Loading Overlay Block */}
            {exportLoading && (
                <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-white/20 text-center max-w-sm w-full space-y-4">
                        <div className="h-16 w-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="text-xl font-black text-teal-900 tracking-tight">Generating Report Asset</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            SV Pharma file engine is compiling real-time records. Your download will trigger automatically.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
