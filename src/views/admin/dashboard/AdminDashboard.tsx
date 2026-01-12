import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity
} from 'lucide-react';
import api from '../../../utils/services/axios';

interface DashboardData {
  sales: {
    today_sales: string;
    total_sales: string;
    today_orders: number;
    total_orders: number;
  };
  payments: {
    cash: string;
    card: string;
    upi: string;
  };
  products: {
    total_products: number;
    low_stock: number;
    out_of_stock: number;
  };
  customers: {
    total_customers: number;
  };
  recent_orders: Array<{
    id: number;
    customer_id: number | null;
    final_amount: string;
    payment_method: string;
    status: string;
    created_at: string;
    customer: {
      id: number;
      name: string;
      phone: string | null;
      email: string | null;
      created_at: string;
      updated_at: string;
    } | null;
  }>;
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats based on API data
  const stats = dashboardData ? [
    {
      title: 'Total Revenue',
      value: `$${parseFloat(dashboardData.sales.total_sales).toFixed(2)}`,
      change: '+0.0%', // You might want to calculate this based on previous data
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: dashboardData.sales.total_orders.toString(),
      change: '+0.0%',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Active Customers',
      value: dashboardData.customers.total_customers.toString(),
      change: '+0.0%', // You might want to calculate this based on previous data
      icon: Users,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      title: 'Inventory Items',
      value: dashboardData.products.total_products.toString(),
      change: dashboardData.products.low_stock > 0 ? '-2.3%' : '+0.0%',
      icon: Package,
      color: dashboardData.products.low_stock > 0 ? 'bg-amber-500' : 'bg-green-500',
      trend: dashboardData.products.low_stock > 0 ? 'down' : 'up'
    }
  ] : [];

  // Payment methods data
  const paymentMethods = dashboardData ? [
    { name: 'Cash', amount: `$${dashboardData.payments.cash}`, color: 'bg-green-500', percentage: parseFloat(dashboardData.payments.cash) > 0 ? '100%' : '0%' },
    { name: 'Card', amount: `$${dashboardData.payments.card}`, color: 'bg-blue-500', percentage: '0%' },
    { name: 'UPI', amount: `$${dashboardData.payments.upi}`, color: 'bg-purple-500', percentage: '0%' }
  ] : [];

  // Alerts based on API data
  const alerts = dashboardData ? [
    ...(dashboardData.products.low_stock > 0 ? [
      {
        type: 'warning',
        message: `${dashboardData.products.low_stock} product${dashboardData.products.low_stock !== 1 ? 's are' : ' is'} running low on stock`,
        icon: AlertCircle
      }
    ] : []),
    ...(dashboardData.products.out_of_stock > 0 ? [
      {
        type: 'error',
        message: `${dashboardData.products.out_of_stock} product${dashboardData.products.out_of_stock !== 1 ? 's are' : ' is'} out of stock`,
        icon: XCircle
      }
    ] : []),
    {
      type: 'success',
      message: `${dashboardData.sales.today_orders} order${dashboardData.sales.today_orders !== 1 ? 's' : ''} completed today`,
      icon: CheckCircle
    },
    {
      type: 'info',
      message: `Today's revenue: $${dashboardData.sales.today_sales}`,
      icon: Clock
    }
  ] : [];

  // Map recent orders from API
  const recentOrders = dashboardData?.recent_orders.map(order => ({
    id: `ORD-${order.id.toString().padStart(3, '0')}`,
    customer: order.customer?.name || 'Walk-in Customer',
    amount: `$${parseFloat(order.final_amount).toFixed(2)}`,
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    date: new Date(order.created_at).toLocaleDateString(),
    paymentMethod: order.payment_method
  })) || [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
        {/* Revenue & Payment Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Sales & Payments Overview</h3>
              <p className="text-gray-600 text-sm">Today's performance</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            {/* Today's Sales */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Today's Sales</h4>
                <span className="text-lg font-bold text-green-600">${dashboardData?.sales.today_sales}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ 
                    width: `${(parseFloat(dashboardData?.sales.today_sales || '0') / 
                    (parseFloat(dashboardData?.sales.today_sales || '1') + 100)) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{dashboardData?.sales.today_orders} orders</span>
                <span>${dashboardData?.sales.today_sales} revenue</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Payment Methods Distribution</h4>
              <div className="space-y-2">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{method.name}</span>
                      <span className="text-sm font-medium text-gray-800">{method.amount}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: method.color.replace('bg-', ''),
                          width: method.percentage
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              const colors = {
                warning: 'bg-amber-50 border-amber-200 text-amber-800',
                success: 'bg-green-50 border-green-200 text-green-800',
                error: 'bg-red-50 border-red-200 text-red-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800'
              };
              return (
                <div key={index} className={`p-3 rounded-lg border ${colors[alert.type as keyof typeof colors]}`}>
                  <div className="flex items-start">
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">View all</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Order ID</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Customer</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Payment</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-3 md:p-4 text-sm text-gray-800 font-medium">{order.id}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-800 font-medium">{order.amount}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-600 capitalize">{order.paymentMethod}</td>
                    <td className="p-3 md:p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Quick Stats</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Wallet className="w-5 h-5 text-blue-500 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Today's Sales</h4>
                </div>
                <p className="text-xl font-bold text-gray-800">${dashboardData?.sales.today_sales || '0.00'}</p>
                <p className="text-xs text-gray-600 mt-1">{dashboardData?.sales.today_orders || 0} orders</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-green-500 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">Total Customers</h4>
                </div>
                <p className="text-xl font-bold text-gray-800">{dashboardData?.customers.total_customers || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Registered customers</p>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Package className="w-5 h-5 text-amber-500 mr-2" />
                  <h4 className="text-sm font-medium text-amber-800">Inventory Status</h4>
                </div>
                <p className="text-xl font-bold text-gray-800">{dashboardData?.products.total_products || 0}</p>
                <div className="flex items-center mt-1">
                  {dashboardData?.products.low_stock ? (
                    <span className="text-xs text-amber-600 mr-2">{dashboardData.products.low_stock} low</span>
                  ) : null}
                  {dashboardData?.products.out_of_stock ? (
                    <span className="text-xs text-red-600">{dashboardData.products.out_of_stock} out</span>
                  ) : null}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-purple-500 mr-2" />
                  <h4 className="text-sm font-medium text-purple-800">Payment Methods</h4>
                </div>
                <p className="text-sm text-gray-800">
                  Cash: ${dashboardData?.payments.cash || '0.00'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Main payment method</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;