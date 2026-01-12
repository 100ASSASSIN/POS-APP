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
  Upload, 
  RefreshCw,
  Package,
  ShoppingBag,
  Loader,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/services/axios';

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  barcode: string;
  image: string;
  status: 'Active' | 'Inactive' | 'Low Stock';
  lastUpdated: string;
  supplier?: string;
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

  // Refs for handling click outside
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        
        if (response.data && response.data.products) {
          const transformedProducts: Product[] = response.data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
            price: parseFloat(product.price) || 0,
            cost: parseFloat(product.cost) || parseFloat(product.price) * 0.7,
            stock: product.stock || 0,
            sku: product.sku || `SKU-${product.id}`,
            barcode: product.barcode || product.sku || `BAR-${product.id}`,
            image: product.product_image || '/api/placeholder/400/300',
            status: product.stock === 0 ? 'Inactive' : product.stock < 10 ? 'Low Stock' : 'Active',
            lastUpdated: product.updated_at || new Date().toISOString(),
            supplier: product.supplier || 'N/A'
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

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.barcode.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Apply category filters
    if (filters.category.length > 0) {
      result = result.filter(product => filters.category.includes(product.category));
    }

    // Apply status filters
    if (filters.status.length > 0) {
      result = result.filter(product => filters.status.includes(product.status));
    }

    // Apply price range filter
    result = result.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply stock level filter
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, filters]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        // Close all action menus
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
    console.log('Edit product:', product);
    // Implement edit logic
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p.id !== id));
        setSelectedProducts(prev => prev.filter(productId => productId !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleViewProduct = (product: Product) => {
    console.log('View product:', product);
    // Implement view logic
  };

  const toggleActionsMenu = (productId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const menu = document.getElementById(`actions-menu-${productId}`);
    if (menu) {
      const isVisible = menu.style.display === 'block';
      // Hide all other menus
      document.querySelectorAll('.actions-menu').forEach(m => {
        (m as HTMLElement).style.display = 'none';
      });
      // Toggle current menu
      menu.style.display = isVisible ? 'none' : 'block';
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'deactivate') => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
          // Implement bulk delete
          selectedProducts.forEach(id => handleDeleteProduct(id));
          setSelectedProducts([]);
        }
        break;
      case 'export':
        // Implement export logic
        console.log('Exporting products:', selectedProducts);
        break;
      case 'deactivate':
        // Implement deactivate logic
        console.log('Deactivating products:', selectedProducts);
        break;
    }
  };

  const handleAddProduct = () => {
    console.log('Add new product');
    // Implement add product logic
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      if (response.data && response.data.products) {
        const transformedProducts: Product[] = response.data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category?.name || 'Uncategorized',
          price: parseFloat(product.price) || 0,
          cost: parseFloat(product.cost) || parseFloat(product.price) * 0.7,
          stock: product.stock || 0,
          sku: product.sku || `SKU-${product.id}`,
          barcode: product.barcode || product.sku || `BAR-${product.id}`,
          image: product.product_image || '/api/placeholder/400/300',
          status: product.stock === 0 ? 'Inactive' : product.stock < 10 ? 'Low Stock' : 'Active',
          lastUpdated: product.updated_at || new Date().toISOString(),
          supplier: product.supplier || 'N/A'
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                onClick={handleAddProduct}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
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
                  {/* Category Filter */}
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

                  {/* Status Filter */}
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

                  {/* Stock Level Filter */}
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

                  {/* Price Range Filter */}
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
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 whitespace-nowrap"
                    >
                      Delete
                    </button>
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
                  <button
                    onClick={handleAddProduct}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentProducts.map(product => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative"
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
                          <h3 className="font-medium text-gray-900 truncate pr-8">{product.name}</h3>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleActionsMenu(product.id, e)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div
                              id={`actions-menu-${product.id}`}
                              className="actions-menu absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 hidden"
                              ref={actionsMenuRef}
                            >
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 truncate">{product.category}</p>
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
                            <p className="text-xs text-gray-500 truncate">{product.sku}</p>
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
                          <div className="flex items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover mr-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.supplier}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{product.sku}</td>
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
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-1 text-blue-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
    </div>
  );
};

export default ProductListPage;