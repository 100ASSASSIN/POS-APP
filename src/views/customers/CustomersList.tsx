import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    //   MoreVertical,
    //   Edit,
    //   Trash2,
    //   Eye,
    Phone,
    Mail,
    Calendar,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Download,
    Printer
} from 'lucide-react';
import api from '../../utils/services/axios';

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    created_at: string;
    updated_at: string;
    orders_count: number;
}

interface CustomersResponse {
    current_page: number;
    data: Customer[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const CustomersList = () => {
    const [customersData, setCustomersData] = useState<CustomersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

    // Fetch customers data
    useEffect(() => {
        const fetchCustomersData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/customers/');
                setCustomersData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching customers data:', err);
                setError('Failed to load customers data');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomersData();
    }, []);

    // Filter customers based on search term
    const filteredCustomers = customersData?.data.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    ) || [];

    // Handle customer selection
    const toggleCustomerSelection = (id: number) => {
        setSelectedCustomers(prev =>
            prev.includes(id)
                ? prev.filter(customerId => customerId !== id)
                : [...prev, id]
        );
    };

    // Handle select all
    const toggleSelectAll = () => {
        if (selectedCustomers.length === filteredCustomers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(filteredCustomers.map(customer => customer.id));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle page change
    const handlePageChange = async (url: string | null) => {
        if (!url) return;

        try {
            setLoading(true);
            const response = await api.get(url);
            setCustomersData(response.data);
        } catch (err) {
            console.error('Error fetching page:', err);
            setError('Failed to load page');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading customers data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Customers</h1>
                        <p className="text-gray-600 mt-1">Manage your customer information and orders</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <UserPlus className="w-4 h-4" />
                            Add Customer
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{customersData?.total || 0} total</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{customersData?.total || 0}</h3>
                    <p className="text-gray-600 text-sm">Total Customers</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-100">
                            <ShoppingBag className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Average</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                        {
                            ((customersData?.data ?? []).reduce(
                                (acc, customer) => acc + (customer.orders_count ?? 0),
                                0
                            ) / (customersData?.total || 1)) || 0
                        }

                    </h3>
                    <p className="text-gray-600 text-sm">Average Orders per Customer</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Calendar className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Recent</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                        {customersData?.data.length || 0}
                    </h3>
                    <p className="text-gray-600 text-sm">Customers on this page</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 md:p-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Customer List</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Showing {customersData?.from || 0} to {customersData?.to || 0} of {customersData?.total || 0} customers
                        </span>
                        {selectedCustomers.length > 0 && (
                            <span className="text-sm text-blue-600">
                                {selectedCustomers.length} selected
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 p-3 md:p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Customer</th>
                                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Contact</th>
                                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Orders</th>
                                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No customers found</p>
                                        {searchTerm && (
                                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="p-3 md:p-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={selectedCustomers.includes(customer.id)}
                                                onChange={() => toggleCustomerSelection(customer.id)}
                                            />
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                                                <p className="text-xs text-gray-500">ID: CUST-{customer.id.toString().padStart(3, '0')}</p>
                                            </div>
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <div className="space-y-1">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{customer.phone}</span>
                                                    </div>
                                                )}
                                                {!customer.email && !customer.phone && (
                                                    <span className="text-sm text-gray-400 italic">No contact info</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <div className="flex items-center">
                                                <ShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-800">{customer.orders_count}</span>
                                                <span className="text-xs text-gray-500 ml-1">order{customer.orders_count !== 1 ? 's' : ''}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600">{formatDate(customer.created_at)}</span>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customersData && customersData.last_page > 1 && (
                    <div className="p-4 md:p-6 border-t">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Page {customersData.current_page} of {customersData.last_page}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(customersData.prev_page_url)}
                                    disabled={!customersData.prev_page_url}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg ${customersData.prev_page_url
                                            ? 'bg-white border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {customersData.links.map((link, index) => (
                                        link.url && (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(link.url)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg ${link.active
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {link.label.replace(/&[a-z]+;/g, '')}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(customersData.next_page_url)}
                                    disabled={!customersData.next_page_url}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg ${customersData.next_page_url
                                            ? 'bg-white border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-sm text-gray-600">
                                {customersData.per_page} per page
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {selectedCustomers.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-4 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                            Export Selected
                        </button>
                        <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                            Delete Selected
                        </button>
                        <button
                            onClick={() => setSelectedCustomers([])}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersList;