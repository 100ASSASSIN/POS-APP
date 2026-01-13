import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Package,
  DollarSign,
  Hash,
  //   Tag,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  //   Layers,
  // Scale,
  Box,
  ClipboardCheck,
  Info,
  //   Shield,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/services/axios';

interface Category {
  id: number;
  name: string;
}

const AddProductPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    cost: '',
    stock: '',
    sku: '',
    tax: '',
    location: '',
    barcode: '',
    status: 'active',
    product_image: null as File | null,
    description: '',
    supplier: '',
    weight: '',
    dimensions: '',
    minimum_stock: '',
    maximum_stock: ''
  });

  // UI states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories
        setCategories([
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, WEBP, GIF)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        product_image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.category_id || !formData.price || !formData.stock || !formData.sku) {
      setError('Please fill in all required fields (marked with *)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

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
      if (formData.cost) formDataToSend.append('cost', formData.cost.toString());
      if (formData.barcode) formDataToSend.append('barcode', formData.barcode);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.supplier) formDataToSend.append('supplier', formData.supplier);
      if (formData.weight) formDataToSend.append('weight', formData.weight.toString());
      if (formData.dimensions) formDataToSend.append('dimensions', formData.dimensions);
      if (formData.tax) formDataToSend.append('tax', formData.tax.toString());
      if (formData.location) formDataToSend.append('location', formData.location.toString());
      if (formData.minimum_stock) formDataToSend.append('minimum_stock', formData.minimum_stock.toString());
      if (formData.maximum_stock) formDataToSend.append('maximum_stock', formData.maximum_stock.toString());

      // Add image if provided
      if (formData.product_image instanceof File) {
        formDataToSend.append('product_image', formData.product_image);
      }

      // Get authentication headers
      const headers = getAuthHeaders();

      // Make the API call
      const response = await api.post('/products', formDataToSend, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.message) {
        setSuccess(true);

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            category_id: '',
            price: '',
            cost: '',
            stock: '',
            sku: '',
            tax: '',
            location: '',
            barcode: '',
            status: 'active',
            product_image: null,
            description: '',
            supplier: '',
            weight: '',
            dimensions: '',
            minimum_stock: '',
            maximum_stock: ''
          });
          setImagePreview('');

          // Navigate back after 2 seconds
          setTimeout(() => {
            navigate('/products');
          }, 2000);
        }, 1000);
      } else {
        throw new Error(response.data?.message || 'Failed to create product');
      }

    } catch (error: any) {
      console.error('Error creating product:', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to create product. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category_id: '',
      price: '',
      cost: '',
      stock: '',
      sku: '',
      barcode: '',
      status: 'active',
      product_image: null,
      description: '',
      location: '',
      supplier: '',
      weight: '',
      dimensions: '',
      tax: '',
      minimum_stock: '',
      maximum_stock: ''
    });
    setImagePreview('');
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">Create a new product in your catalog</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReset}
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-700 font-medium">Product created successfully!</p>
                  <p className="text-green-600 text-sm mt-1">Redirecting to product list...</p>
                </div>
              </div>
            </div>
          )}

          {/* API Info */}
          {/* <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 mb-1">API Integration</p>
                <p className="text-xs text-blue-700">
                  This form will submit to: POST <code className="bg-blue-100 px-1 rounded">/api/products</code>
                  <br />
                  Authentication headers (x-api-key, Authorization) will be automatically included.
                </p>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Package className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Product Information</h2>
                    <p className="text-sm text-gray-600">Fill in the details for your new product</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>

                    {/* Category & SKU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Category
                        </label>
                        <select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          disabled={loading}
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {loading && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                            Loading categories...
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> SKU (Stock Keeping Unit)
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., PROD-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> TAX
                        </label>
                        <input
                          type="text"
                          name="tax"
                          value={formData.tax}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 2%"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g.,2nd Floor, Prestige Tech Park
Marathahalli–Sarjapur Outer Ring Road
Bengaluru, Karnataka – 560103"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your product in detail..."
                      />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Selling Price ($)
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost Price ($)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="cost"
                            value={formData.cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Stock Quantity
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
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Supplier & Barcode */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supplier
                        </label>
                        <input
                          type="text"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Supplier name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Barcode
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 123456789012"
                        />
                      </div>
                    </div> */}

                    {/* Stock Management */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Stock Level
                        </label>
                        <input
                          type="number"
                          name="minimum_stock"
                          value={formData.minimum_stock}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Stock Level
                        </label>
                        <input
                          type="number"
                          name="maximum_stock"
                          value={formData.maximum_stock}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div> */}

                    {/* Physical Properties */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Scale className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dimensions (L×W×H)
                        </label>
                        <input
                          type="text"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 10×5×2 cm"
                        />
                      </div>
                    </div> */}
                  </div>

                  {/* Right Column - Image Upload & Preview */}
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Product Image
                      </h3>

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
                                  setFormData(prev => ({ ...prev, product_image: null }));
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
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Upload Product Image
                              </p>
                              <p className="text-xs text-gray-500">
                                Drag & drop or click to browse
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG, WEBP, GIF • Max 5MB
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

                      <div className="mt-4 text-xs text-gray-500">
                        <p className="flex items-center mb-1">
                          <Info className="w-3 h-3 mr-1" />
                          Recommended size: 800×600px
                        </p>
                      </div>
                    </div>

                    {/* API Payload Preview */}
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        API Request Preview
                      </h3>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="text-blue-600 font-medium">Endpoint:</span>
                          <code className="block bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 font-mono">
                            POST /api/products
                          </code>
                        </div>
                        <div className="text-xs">
                          <span className="text-blue-600 font-medium">Method:</span>
                          <code className="block bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 font-mono">
                            multipart/form-data
                          </code>
                        </div>
                        <div className="text-xs">
                          <span className="text-blue-600 font-medium">Sample Payload:</span>
                          <pre className="bg-blue-100 text-blue-800 p-2 rounded mt-1 overflow-x-auto text-xs">
{`{
  "category_id": "${formData.category_id || '2'}",
  "name": "${formData.name || 'Product Name'}",
  "price": "${formData.price || '0.00'}",
  "stock": "${formData.stock || '0'}",
  "sku": "${formData.sku || 'SKU-001'}",
  "status": "${formData.status}",
  "product_image": [File]
}`}</pre>
                        </div>
                      </div>
                    </div> */}

                    {/* Form Tips */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center">
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Form Tips
                      </h3>
                      <ul className="space-y-2 text-xs text-green-700">
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                          <span>Fields marked with <span className="text-red-500">*</span> are required</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                          <span>SKU should be unique for each product</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                          <span>Set minimum stock level for auto-reorder alerts</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
                          <span>Cost price is used for profit calculation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <p>All required fields must be filled before submission.</p>
                    <p className="text-xs mt-1">Product will be added to your catalog immediately.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/products')}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                    >
                      {submitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Product
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Box className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-800">Inventory Management</h4>
              </div>
              <p className="text-xs text-gray-600">
                Products added here will appear in your inventory and can be sold, tracked, and managed.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-800">Stock Tracking</h4>
              </div>
              <p className="text-xs text-gray-600">
                Set minimum and maximum stock levels to receive alerts and optimize inventory.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <ShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-800">Sales Ready</h4>
              </div>
              <p className="text-xs text-gray-600">
                Once created, this product will be immediately available for sale in your POS system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;