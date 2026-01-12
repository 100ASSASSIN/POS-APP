import { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  RefreshCw,
  Package,
  ShoppingBag,
  Loader,
  X,
  AlertCircle,
  DollarSign,
  Hash,
  Save,
  Image as ImageIcon,
  User,
  Calendar,
  Clock,
  TrendingUp,
  Info,
  BarChart,
  Activity
} from 'lucide-react';
import api from '../../utils/services/axios';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  category: string;
  category_id?: number;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  barcode: string;
  image: string;
  product_image?: string;
  status: 'Active' | 'Inactive' | 'Low Stock' | 'active' | 'inactive';
  lastUpdated: string;
  supplier?: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  minimum_stock?: number;
  maximum_stock?: number;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  count: number;
}

interface FilterOptions {
  category: string[];
  status: string[];
  priceRange: [number, number];
  stockLevel: 'all' | 'low' | 'out' | 'good';
}

// Role-based permission component
interface ProtectedComponentProps {
  children: React.ReactNode;
  allowedRoles: string[];
  currentRole?: string;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ 
  children, 
  allowedRoles, 
  currentRole = 'admin'
}) => {
  if (allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }
  return null;
};

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemCount?: number;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemCount = 1
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">
                {itemCount > 1 ? `${itemCount} items selected` : 'This action cannot be undone'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Product Details Modal Component
interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!isOpen || !product) return null;

  const stats = [
    {
      label: 'Profit Margin',
      value: `${(((product.price - product.cost) / product.cost) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Stock Value',
      value: `$${(product.price * product.stock).toLocaleString()}`,
      icon: BarChart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Reorder Level',
      value: product.minimum_stock ? `${product.minimum_stock} units` : 'Not Set',
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
              <p className="text-sm text-gray-600">View complete product information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Product Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-2/5">
                <div className="relative h-64 md:h-full rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === 'Active' || product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'Inactive' || product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-3/5">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      SKU: {product.sku}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      Barcode: {product.barcode}
                    </span>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className={`${stat.bgColor} p-4 rounded-xl`}>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                          <span className={`text-xs font-medium ${stat.color}`}>
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Price & Stock */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                      <p className="text-2xl font-bold text-gray-800">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cost Price</p>
                      <p className="text-xl font-semibold text-gray-700">${product.cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                      <p className={`text-2xl font-bold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock} units
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Availability</p>
                      <p className={`text-lg font-semibold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 10 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' :
                         product.stock < 10 ? 'Low Stock' :
                         'In Stock'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Product Details
                </h4>
                {/* <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier</span>
                    <span className="font-medium">{product.supplier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{product.weight ? `${product.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-medium">{product.dimensions || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Stock</span>
                    <span className="font-medium">{product.minimum_stock || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum Stock</span>
                    <span className="font-medium">{product.maximum_stock || 'Not Set'}</span>
                  </div>
                </div> */}
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Timeline
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Created</p>
                      <p className="text-sm text-gray-600">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(product.lastUpdated).toLocaleDateString()} at{' '}
                        {new Date(product.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Analysis */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Stock Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {product.stock}
                  </div>
                  <div className="text-sm text-gray-600">Current Units</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${(product.price * product.stock).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {product.minimum_stock ? 
                      (product.stock <= product.minimum_stock ? 'Reorder Now' : 'OK') 
                      : 'Not Set'}
                  </div>
                  <div className="text-sm text-gray-600">Stock Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-2" />
              Product ID: {product.id}
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Product Modal Component
interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, formData: any) => Promise<void>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    sku: '',
    status: 'active',
    product_image: null as File | null,
    description: '',
    supplier: '',
    weight: '',
    dimensions: '',
    minimum_stock: '',
    maximum_stock: ''
  });
  
  const [categories] = useState([
    { id: 1, name: 'Accessories' },
    { id: 2, name: 'Cables' },
    { id: 3, name: 'Electronics' },
    { id: 4, name: 'Electronics' },
    { id: 5, name: 'Accessories' },
    { id: 6, name: 'Fruits' },
    { id: 7, name: 'Vegetables' },
    { id: 8, name: 'Dairy' },
    { id: 9, name: 'Meat' },
    { id: 10, name: 'Bakery' },
    { id: 11, name: 'Beverages' },
    { id: 12, name: 'Pantry' },
    { id: 13, name: 'Seafood' },
    { id: 14, name: 'Frozen' }
  ]);
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || categories.find(c => c.name === product.category)?.id || '',
        price: product.price.toString() || '',
        stock: product.stock.toString() || '',
        sku: product.sku || '',
        status: product.status === 'Active' ? 'active' : 
                product.status === 'Inactive' ? 'inactive' : 
                product.status === 'Low Stock' ? 'active' : 'active',
        product_image: null,
        description: product.description || '',
        supplier: product.supplier || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        minimum_stock: product.minimum_stock?.toString() || '',
        maximum_stock: product.maximum_stock?.toString() || ''
      });
      setImagePreview(product.image || product.product_image || '');
      setError(null);
    }
  }, [product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        product_image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const finalFormData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        category_id: parseInt(formData.category_id) || 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : null,
        maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null
      };
      
      await onSave(product.id, finalFormData);
      setIsSubmitting(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Edit className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
              <p className="text-sm text-gray-600">Update product information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors relative">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg mx-auto"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setFormData((prev: any) => ({ ...prev, product_image: null }));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Drop your image here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports: JPG, PNG, WEBP, GIF (Max 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>
                </div> */}
              </div>
            </div>

            {/* Additional Information */}
            {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L×W×H)
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10×5×2 cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={formData.minimum_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock
                </label>
                <input
                  type="number"
                  name="maximum_stock"
                  value={formData.maximum_stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div> */}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Product List Component
const ProductListPage = () => {
  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    status: [],
    priceRange: [0, 5000],
    stockLevel: 'all'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null as number | null,
    productName: '',
    isBulk: false,
    itemCount: 0
  });

  // User role from auth context
  const { user } = useAuth();
  const currentUserRole = user?.role || 'viewer';

  // Refs for handling click outside
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const accessToken = getCookie('access_token') || localStorage.getItem('access_token');
    const apiKey = localStorage.getItem('api_key') || '9f8c2e7b1a6d4f0e8c5a3b9d7e2f4a6c1d0b5e9a8f7c3b2d6a4e1c9f8';

    return {
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'x-api-key': apiKey,
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products', {
          headers: getAuthHeaders()
        });
        
        if (response.data && response.data.products) {
          const transformedProducts: Product[] = response.data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
            category_id: product.category_id,
            price: parseFloat(product.price) || 0,
            cost: parseFloat(product.cost) || parseFloat(product.price) * 0.7,
            stock: product.stock || 0,
            sku: product.sku || `SKU-${product.id}`,
            barcode: product.barcode || product.sku || `BAR-${product.id}`,
            image: product.product_image || '/api/placeholder/400/300',
            product_image: product.product_image,
            status: product.stock === 0 ? 'Inactive' : product.stock < 10 ? 'Low Stock' : 'Active',
            lastUpdated: product.updated_at || new Date().toISOString(),
            supplier: product.supplier || 'N/A',
            description: product.description,
            weight: product.weight,
            dimensions: product.dimensions,
            minimum_stock: product.minimum_stock,
            maximum_stock: product.maximum_stock,
            created_at: product.created_at
          }));

          setProducts(transformedProducts);
          setFilteredProducts(transformedProducts);
          
          // Generate categories from products
          const categoryMap = new Map<string, number>();
          transformedProducts.forEach(product => {
            categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
          });

          const categoryList: Category[] = Array.from(categoryMap.entries()).map(([name, count], index) => ({
            id: index + 1,
            name,
            count
          }));

          setCategories(categoryList);
          setError(null);
        } else {
          throw new Error('No products data received');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters whenever filters or search term change
  useEffect(() => {
    let result = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.supplier?.toLowerCase().includes(term)
      );
    }

    if (filters.category.length > 0) {
      result = result.filter(product => filters.category.includes(product.category));
    }

    if (filters.status.length > 0) {
      result = result.filter(product => filters.status.includes(product.status));
    }

    result = result.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    if (filters.stockLevel !== 'all') {
      switch (filters.stockLevel) {
        case 'low':
          result = result.filter(product => product.stock < 10 && product.stock > 0);
          break;
        case 'out':
          result = result.filter(product => product.stock === 0);
          break;
        case 'good':
          result = result.filter(product => product.stock >= 10);
          break;
      }
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, filters]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        document.querySelectorAll('.actions-menu').forEach(menu => {
          (menu as HTMLElement).style.display = 'none';
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter handlers
  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const handleStockLevelFilter = (level: 'all' | 'low' | 'out' | 'good') => {
    setFilters(prev => ({
      ...prev,
      stockLevel: level
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      status: [],
      priceRange: [0, 5000],
      stockLevel: 'all'
    });
    setSearchTerm('');
  };

  // Product actions
  const handleSelectProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(p => p.id));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (productId: number, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
      isBulk: false,
      itemCount: 1
    });
  };

  const handleBulkDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      productId: null,
      productName: '',
      isBulk: true,
      itemCount: selectedProducts.length
    });
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}`, {
        headers: getAuthHeaders()
      });
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedProducts) {
        await api.delete(`/products/${id}`, {
          headers: getAuthHeaders()
        });
      }
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    } catch (err) {
      console.error('Error deleting products:', err);
    }
  };

  const toggleActionsMenu = (productId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const menu = document.getElementById(`actions-menu-${productId}`);
    if (menu) {
      const isVisible = menu.style.display === 'block';
      document.querySelectorAll('.actions-menu').forEach(m => {
        (m as HTMLElement).style.display = 'none';
      });
      menu.style.display = isVisible ? 'none' : 'block';
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'deactivate') => {
    switch (action) {
      case 'delete':
        handleBulkDeleteClick();
        break;
      case 'export':
        console.log('Exporting products:', selectedProducts);
        break;
      case 'deactivate':
        console.log('Deactivating products:', selectedProducts);
        break;
    }
  };

  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate("/products/create");
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.products) {
        const transformedProducts: Product[] = response.data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category?.name || 'Uncategorized',
          category_id: product.category_id,
          price: parseFloat(product.price) || 0,
          cost: parseFloat(product.cost) || parseFloat(product.price) * 0.7,
          stock: product.stock || 0,
          sku: product.sku || `SKU-${product.id}`,
          barcode: product.barcode || product.sku || `BAR-${product.id}`,
          image: product.product_image || '/api/placeholder/400/300',
          product_image: product.product_image,
          status: product.stock === 0 ? 'Inactive' : product.stock < 10 ? 'Low Stock' : 'Active',
          lastUpdated: product.updated_at || new Date().toISOString(),
          supplier: product.supplier || 'N/A',
          description: product.description,
          weight: product.weight,
          dimensions: product.dimensions,
          minimum_stock: product.minimum_stock,
          maximum_stock: product.maximum_stock,
          created_at: product.created_at
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing products:', err);
      setError('Failed to refresh products');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productId: number, formData: any) => {
    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category_id', formData.category_id.toString());
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('status', formData.status);
      
      // Add optional fields if they exist
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.supplier) formDataToSend.append('supplier', formData.supplier);
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString());
      if (formData.dimensions) formDataToSend.append('dimensions', formData.dimensions);
      if (formData.minimum_stock) formDataToSend.append('minimum_stock', formData.minimum_stock.toString());
      if (formData.maximum_stock) formDataToSend.append('maximum_stock', formData.maximum_stock.toString());
      
      // Add image if provided
      if (formData.product_image instanceof File) {
        formDataToSend.append('product_image', formData.product_image);
      }

      // Make the API call
      const response = await api.post(`/products/${productId}`, formDataToSend, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.message) {
        // Refresh the products list
        await handleRefresh();
        
        setIsEditModalOpen(false);
        setEditingProduct(null);
      } else {
        throw new Error(response.data?.message || 'Failed to update product');
      }
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Stats calculation
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'Active').length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    inactive: products.filter(p => p.status === 'Inactive').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - REMOVED Import/Export buttons */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <User className="w-4 h-4 mr-2" />
                  Role: {currentUserRole}
                </div>
              </div>
              <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Only show Add Product button */}
              <ProtectedComponent allowedRoles={['admin']} currentRole={currentUserRole}>
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </ProtectedComponent>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.lowStock}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.inactive}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold mt-1">${stats.totalValue.toLocaleString()}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center px-3 py-2 rounded-lg border ${
                      isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700'
                    } whitespace-nowrap`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {Object.values(filters).flat().length > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {Object.values(filters).flat().length}
                      </span>
                    )}
                  </button>
                  {Object.values(filters).flat().length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 whitespace-nowrap"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {categories.length > 0 ? categories.map(cat => (
                        <label key={cat.id} className="flex items-center hover:bg-gray-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(cat.name)}
                            onChange={() => handleCategoryFilter(cat.name)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm flex-1">{cat.name}</span>
                          <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {cat.count}
                          </span>
                        </label>
                      )) : (
                        <p className="text-sm text-gray-500">No categories available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="space-y-2">
                      {['Active', 'Inactive', 'Low Stock'].map(status => (
                        <label key={status} className="flex items-center hover:bg-gray-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => handleStatusFilter(status)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
                    <div className="space-y-2">
                      {(['all', 'good', 'low', 'out'] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => handleStockLevelFilter(level)}
                          className={`block w-full text-left px-3 py-2 rounded text-sm ${
                            filters.stockLevel === level
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {level === 'all' && 'All Stock Levels'}
                          {level === 'good' && 'Good Stock (10+)'}
                          {level === 'low' && 'Low Stock (1-9)'}
                          {level === 'out' && 'Out of Stock'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="0"
                          max="5000"
                          value={filters.priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(parseInt(e.target.value) || 0, filters.priceRange[1])}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="number"
                          min="0"
                          max="5000"
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(filters.priceRange[0], parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-700">
                    {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <ProtectedComponent allowedRoles={['admin']} currentRole={currentUserRole}>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </ProtectedComponent>
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 whitespace-nowrap"
                    >
                      Export Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 whitespace-nowrap"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-gray-600 hover:text-gray-800 whitespace-nowrap"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Products Area */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try adjusting your filters or search term</p>
                {searchTerm || Object.values(filters).flat().length > 0 ? (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                ) : (
                  <ProtectedComponent allowedRoles={['admin', 'manager']} currentRole={currentUserRole}>
                    <button
                      onClick={handleAddProduct}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Product
                    </button>
                  </ProtectedComponent>
                )}
              </div>
            ) : viewMode === 'grid' ? (
             <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentProducts.map(product => (
        <div
          key={product.id}
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative bg-white"
        >
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
              }}
            />
            <div className="absolute top-2 right-2 z-10">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleSelectProduct(product.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                product.status === 'Active' ? 'bg-green-100 text-green-800' :
                product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.status}
              </span>
            </div>
          </div>
          <div className="p-4 relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 truncate pr-8" title={product.name}>
                {product.name}
              </h3>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const menu = document.getElementById(`actions-menu-${product.id}`);
                    if (menu) {
                      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {/* Action Menu - Using DOM manipulation */}
                <div
                  id={`actions-menu-${product.id}`}
                  className="actions-menu absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden"
                  style={{ top: '100%' }}
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        document.getElementById(`actions-menu-${product.id}`)!.style.display = 'none';
                        handleViewProduct(product);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <ProtectedComponent allowedRoles={['admin', 'manager']} currentRole={currentUserRole}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById(`actions-menu-${product.id}`)!.style.display = 'none';
                          handleEditProduct(product);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    </ProtectedComponent>
                    <ProtectedComponent allowedRoles={['admin']} currentRole={currentUserRole}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById(`actions-menu-${product.id}`)!.style.display = 'none';
                          handleDeleteClick(product.id, product.name);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </ProtectedComponent>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3 truncate" title={product.category}>
              {product.category}
            </p>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Cost: ${product.cost.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  product.stock === 0 ? 'text-red-600' :
                  product.stock < 10 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {product.stock} in stock
                </p>
                <p className="text-xs text-gray-500 truncate" title={product.sku}>
                  {product.sku}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 truncate">
              Updated: {new Date(product.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Product</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">SKU</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Price</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Stock</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map(product => (
                      <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center min-w-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              {/* FIXED: Added max-width and proper truncation */}
                              <p className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]" title={product.supplier}>
                                {product.supplier || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs inline-block max-w-[120px] truncate" title={product.category}>
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[120px]" title={product.sku}>
                          {product.sku}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Cost: ${product.cost.toFixed(2)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className={`font-medium ${
                            product.stock === 0 ? 'text-red-600' :
                            product.stock < 10 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {product.stock}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            product.status === 'Active' ? 'bg-green-100 text-green-800' :
                            product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <ProtectedComponent allowedRoles={['admin', 'manager']} currentRole={currentUserRole}>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </ProtectedComponent>
                            <ProtectedComponent allowedRoles={['admin']} currentRole={currentUserRole}>
                              <button
                                onClick={() => handleDeleteClick(product.id, product.name)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </ProtectedComponent>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {[12, 24, 48, 96].map(size => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg min-w-[40px] ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => {
          if (deleteModal.isBulk) {
            handleBulkDelete();
          } else if (deleteModal.productId) {
            handleDeleteProduct(deleteModal.productId);
          }
        }}
        title={deleteModal.isBulk ? `Delete ${deleteModal.itemCount} Products` : `Delete "${deleteModal.productName}"`}
        message={deleteModal.isBulk 
          ? `Are you sure you want to delete ${deleteModal.itemCount} selected products? This action cannot be undone.`
          : `Are you sure you want to delete this product? This action cannot be undone.`
        }
        itemCount={deleteModal.itemCount}
      />

      {/* View Product Modal */}
      <ViewProductModal
        product={viewingProduct}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProduct(null);
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductListPage;