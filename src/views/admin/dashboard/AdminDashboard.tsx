import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+12.5%',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Active Customers',
      value: '5,678',
      change: '+18.2%',
      icon: Users,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      title: 'Inventory Items',
      value: '8,432',
      change: '-2.3%',
      icon: Package,
      color: 'bg-amber-500',
      trend: 'down'
    }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Smith', amount: '$124.99', status: 'Delivered', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Emma Wilson', amount: '$89.50', status: 'Processing', date: '2024-01-15' },
    { id: 'ORD-003', customer: 'Michael Chen', amount: '$245.75', status: 'Shipped', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Sarah Johnson', amount: '$67.25', status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-005', customer: 'David Brown', amount: '$189.99', status: 'Delivered', date: '2024-01-13' }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', category: 'Electronics', sales: 234, revenue: '$56,160' },
    { name: 'Nike Air Max', category: 'Footwear', sales: 189, revenue: '$28,350' },
    { name: 'Sony Headphones', category: 'Audio', sales: 156, revenue: '$31,200' },
    { name: 'Coffee Maker', category: 'Home Appliances', sales: 142, revenue: '$21,300' },
    { name: 'Yoga Mat', category: 'Fitness', sales: 127, revenue: '$6,350' }
  ];

  const alerts = [
    { type: 'warning', message: '5 products are running low on stock', icon: AlertCircle },
    { type: 'success', message: 'System backup completed successfully', icon: CheckCircle },
    { type: 'error', message: 'Payment gateway connection issue', icon: XCircle },
    { type: 'info', message: 'Monthly maintenance scheduled for tomorrow', icon: Clock }
  ];

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
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
              <p className="text-gray-600 text-sm">Last 30 days performance</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">Revenue chart visualization</p>
              <p className="text-sm text-gray-500 mt-1">(Chart would appear here)</p>
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
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-3 md:p-4 text-sm text-gray-800 font-medium">{order.id}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="p-3 md:p-4 text-sm text-gray-800 font-medium">{order.amount}</td>
                    <td className="p-3 md:p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
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

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Product</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Category</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Sales</th>
                  <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 md:p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-sm text-gray-600">{product.category}</td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(product.sales / 250) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-800">{product.sales}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-sm font-medium text-gray-800">{product.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 md:p-6">
          <h4 className="text-sm opacity-90 mb-1">Average Order Value</h4>
          <p className="text-xl text-white md:text-2xl font-bold">$98.45</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 md:p-6">
          <h4 className="text-sm opacity-90 mb-1">Conversion Rate</h4>
          <p className="text-xl md:text-2xl font-bold">3.2%</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 md:p-6">
          <h4 className="text-sm opacity-90 mb-1">Customer Satisfaction</h4>
          <p className="text-xl md:text-2xl font-bold">94.7%</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4 md:p-6">
          <h4 className="text-sm opacity-90 mb-1">Inventory Value</h4>
          <p className="text-xl md:text-2xl font-bold">$125K</p>
        </div>
      </div> */}
    </div>
  );
};

export default AdminDashboard;