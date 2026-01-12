import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  ShoppingCart,
  DollarSign,
  Printer,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  Home,
  Coffee,
  Apple,
  Carrot,
  Milk,
  Beef,
  Download,
  FileText,
  X as CloseIcon,
  Loader,
  Box,
  Cpu,
  Cable,
  Fish,
  Snowflake,
  Egg,
  Cookie,
  Utensils
} from 'lucide-react';
import api from '../../utils/services/axios';

// Define TypeScript interfaces
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image: string;
  color: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
}

// API Response Interface
interface ApiProduct {
  id: number;
  category_id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  product_image: string;
  category: {
    id: number;
    name: string;
  };
}

interface ApiResponse {
  products: ApiProduct[];
}

const HomePage = () => {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>('/products');
        
        // Transform API response to match our Product interface
        const transformedProducts: Product[] = response.data.products.map(product => {
          // Get color based on category
          const color = getCategoryColor(product.category.name);
          
          // Generate image URL (assuming base URL is set in axios)
          const imageUrl = product.product_image;
          
          return {
            id: product.id,
            name: product.name,
            category: product.category.name,
            price: parseFloat(product.price),
            stock: product.stock,
            barcode: product.sku,
            image: imageUrl,
            color: color
          };
        });
        
        setProducts(transformedProducts);
        
        // Generate dynamic categories from products
        const uniqueCategories = generateDynamicCategories(transformedProducts);
        setCategories([
          { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' },
          ...uniqueCategories
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        // Fallback to mock data if API fails
        const fallbackProducts = getFallbackProducts();
        setProducts(fallbackProducts);
        
        // Generate categories from fallback products
        const fallbackCategories = generateDynamicCategories(fallbackProducts);
        setCategories([
          { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' },
          ...fallbackCategories
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Mock data for POS status
  // const posStatus = {
  //   isOnline: true,
  //   currentShift: 'Morning Shift (8:00 AM - 4:00 PM)',
  //   cashier: 'John Doe',
  //   registerBalance: 12500.75,
  //   pendingOrders: 3,
  //   lowStockItems: 7,
  //   todaySales: 42,
  //   dailyRevenue: 8450.50
  // };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  // Helper function to generate dynamic categories from products
  const generateDynamicCategories = (products: Product[]): Category[] => {
    // Get unique category names from products
    const uniqueCategoryNames = Array.from(new Set(products.map(p => p.category)));
    
    // Create category objects with icons and colors
    return uniqueCategoryNames.map(categoryName => {
      const categoryConfig = getCategoryConfig(categoryName);
      return {
        name: categoryName,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
        activeColor: categoryConfig.activeColor
      };
    });
  };

  // Helper function to get category configuration
  const getCategoryConfig = (categoryName: string): {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    activeColor: string;
  } => {
    const categoryMap: Record<string, {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      activeColor: string;
    }> = {
      'Fruits': { icon: Apple, color: 'bg-red-100 text-red-800 hover:bg-red-200', activeColor: 'bg-red-600 text-white' },
      'Vegetables': { icon: Carrot, color: 'bg-green-100 text-green-800 hover:bg-green-200', activeColor: 'bg-green-600 text-white' },
      'Dairy': { icon: Milk, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', activeColor: 'bg-blue-600 text-white' },
      'Meat': { icon: Beef, color: 'bg-rose-100 text-rose-800 hover:bg-rose-200', activeColor: 'bg-rose-600 text-white' },
      'Bakery': { icon: ShoppingBag, color: 'bg-amber-100 text-amber-800 hover:bg-amber-200', activeColor: 'bg-amber-600 text-white' },
      'Beverages': { icon: Coffee, color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', activeColor: 'bg-orange-600 text-white' },
      'Pantry': { icon: Package, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', activeColor: 'bg-yellow-600 text-white' },
      'Seafood': { icon: Fish, color: 'bg-pink-100 text-pink-800 hover:bg-pink-200', activeColor: 'bg-pink-600 text-white' },
      'Frozen': { icon: Snowflake, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', activeColor: 'bg-purple-600 text-white' },
      'Electronics': { icon: Cpu, color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200', activeColor: 'bg-indigo-600 text-white' },
      'Accessories': { icon: Cable, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-600 text-white' },
      'Cables': { icon: Cable, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-600 text-white' },
      'Eggs': { icon: Egg, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', activeColor: 'bg-yellow-600 text-white' },
      'Snacks': { icon: Cookie, color: 'bg-amber-100 text-amber-800 hover:bg-amber-200', activeColor: 'bg-amber-600 text-white' },
      'Utensils': { icon: Utensils, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-600 text-white' },
      'General': { icon: Box, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-600 text-white' }
    };

    // Default configuration for unknown categories
    const defaultConfig = {
      icon: Box,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      activeColor: 'bg-gray-600 text-white'
    };

    return categoryMap[categoryName] || defaultConfig;
  };

  // Helper function to get category color for product cards
  const getCategoryColor = (categoryName: string): string => {
    const colorMap: Record<string, string> = {
      'Fruits': 'bg-red-50 border-red-100',
      'Vegetables': 'bg-green-50 border-green-100',
      'Dairy': 'bg-blue-50 border-blue-100',
      'Meat': 'bg-rose-50 border-rose-100',
      'Bakery': 'bg-amber-50 border-amber-100',
      'Beverages': 'bg-orange-50 border-orange-100',
      'Pantry': 'bg-yellow-50 border-yellow-100',
      'Seafood': 'bg-pink-50 border-pink-100',
      'Frozen': 'bg-purple-50 border-purple-100',
      'Electronics': 'bg-indigo-50 border-indigo-100',
      'Accessories': 'bg-gray-50 border-gray-100',
      'Cables': 'bg-gray-50 border-gray-100',
      'Eggs': 'bg-yellow-50 border-yellow-100',
      'Snacks': 'bg-amber-50 border-amber-100',
      'Utensils': 'bg-gray-50 border-gray-100',
      'General': 'bg-gray-50 border-gray-100'
    };
    
    return colorMap[categoryName] || 'bg-gray-50 border-gray-100';
  };

  // Helper function to get default image based on category
  const getDefaultImage = (categoryName: string): string => {
    const defaultImages: Record<string, string> = {
      'Fruits': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1540420828642-fca2c5c18abb?w=400&h=300&fit=crop',
      'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      'Beverages': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
      'Pantry': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop',
      'Seafood': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      'Frozen': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      'Accessories': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      'Cables': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop'
    };
    
    return defaultImages[categoryName] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop';
  };

  // Fallback products in case API fails
  const getFallbackProducts = (): Product[] => [
    { 
      id: 1, 
      name: 'Fresh Apples', 
      category: 'Fruits', 
      price: 3.99, 
      stock: 45, 
      barcode: '123456789',
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
      color: 'bg-red-50 border-red-100'
    },
    { 
      id: 2, 
      name: 'Banana Bunch', 
      category: 'Fruits', 
      price: 2.49, 
      stock: 68, 
      barcode: '123456790',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
      color: 'bg-yellow-50 border-yellow-100'
    },
    { 
      id: 4, 
      name: 'Organic Milk', 
      category: 'Dairy', 
      price: 4.99, 
      stock: 32, 
      barcode: '123456792',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      color: 'bg-blue-50 border-blue-100'
    }
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: 1,
          image: product.image 
        }];
      }
    });
    
    // Auto-open drawer when adding items
    if (!isDrawerOpen) {
      setIsDrawerOpen(true);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  const handleOpenDrawer = () => {
    console.log('Opening cash drawer...');
  };

  const handlePrintReceipt = () => {
    console.log('Printing receipt...');
    // Print receipt logic
  };

  const handleProcessPayment = async () => {
    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        payment_method: 'cash' // You can make this dynamic
      };

      // Send order to API
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        alert(`Payment processed successfully! Order ID: ${response.data.order_id}`);
        clearCart(); // Clear cart after successful payment
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Generate PDF for the current cart
      const response = await api.post('/generate-receipt', {
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        date: new Date().toISOString()
      }, {
        responseType: 'blob' // Important for PDF download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleExportBill = async () => {
    try {
      // Export bill data
      const billData = {
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        date: new Date().toISOString()
      };

      // You can export as JSON or CSV
      const dataStr = JSON.stringify(billData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bill-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('Bill exported successfully');
    } catch (error) {
      console.error('Bill export error:', error);
      alert('Failed to export bill. Please try again.');
    }
  };

  // Get drawer width based on screen size
  const getDrawerWidth = () => {
    if (isMobile) return 'w-full';
    if (isTablet) return 'w-3/4';
    return 'w-[500px]';
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Supermarket POS</h1>
              {/* Cart Button - Always visible on all screen sizes */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center px-3 py-4 bg-primary text-white rounded-md  transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Cart ({cart.length})
                  {cart.length > 0 && (
                    <span className="ml-1 text-sm">${total.toFixed(2)}</span>
                  )}
                </span>
              </button>
            </div>
            {/* <div className="flex flex-wrap items-center mt-2 gap-2">
              <div className={`flex items-center px-3 py-1 rounded-full ${posStatus.isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${posStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs sm:text-sm font-medium">
                  {posStatus.isOnline ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {posStatus.currentShift} • Cashier: {posStatus.cashier}
              </span>
            </div> */}
          </div>
          
          {/* Stats Overview */}
          {/* <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <div className="text-center sm:text-right flex-1 sm:flex-none">
              <p className="text-xs text-gray-600">Today's Revenue</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">${posStatus.dailyRevenue.toFixed(2)}</p>
            </div>
            <div className="text-center sm:text-right flex-1 sm:flex-none">
              <p className="text-xs text-gray-600">Total Sales</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600">{posStatus.todaySales}</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
        {/* Search and Categories */}
        <div className="mb-4 sm:mb-6">
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base"
            />
          </div>
          
          {/* Simple Text Category Filter */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700 mr-3">Categories:</h4>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  Clear filter
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      isActive 
                        ? `${category.activeColor} shadow` 
                        : `${category.color} hover:shadow`
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Selected Category Info */}
          {selectedCategory !== 'All' && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing <span className="font-bold">{selectedCategory}</span> products
                <span className="ml-2 text-blue-600">
                  ({filteredProducts.length} of {products.length} total products)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
              Product Catalog
              {loading && (
                <Loader className="w-4 h-4 ml-2 animate-spin text-blue-600" />
              )}
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
              {filteredProducts.length} products
            </span>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 text-red-600">
              <p className="font-medium mb-2">{error}</p>
              <p className="text-sm text-gray-600">Showing fallback products</p>
            </div>
          )}
          
          {/* Product Grid with responsive columns */}
          {!loading && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-350px)] overflow-y-auto p-1">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer ${product.color}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-2 sm:mb-3">
                      <div className="h-28 sm:h-32 md:h-36 rounded-lg overflow-hidden mb-2 sm:mb-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback image if product image fails to load
                            (e.target as HTMLImageElement).src = getDefaultImage(product.category);
                          }}
                        />
                      </div>
                      <h4 className="font-bold text-gray-800 line-clamp-2 mb-1 sm:mb-2 text-sm sm:text-base">{product.name}</h4>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white rounded-full text-gray-600">
                          {product.category}
                        </span>
                        <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold ${
                          product.stock > 20
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 hidden sm:block">Price</span>
                          <p className="font-bold text-base sm:text-lg md:text-xl text-gray-800">${product.price.toFixed(2)}</p>
                        </div>
                        <button className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full shadow hover:shadow-lg hover:bg-blue-50 hover:text-blue-600 transition-all group">
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No products found</p>
              <p className="text-xs sm:text-sm">Try a different search term or category</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button for Mobile/Tablet */}
      {!isDrawerOpen && (isMobile || isTablet) && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer (Right Side - On Top Layer) */}
      <div className={`fixed top-0 right-0 h-screen ${getDrawerWidth()} bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Current Sale</h2>
              {cart.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 py-1 rounded-full">
                  {cart.length} items
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearCart}
                className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              {cart.length === 0 ? (
                <div className="py-8 sm:py-12 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No items in cart</p>
                  <p className="text-xs sm:text-sm">Add products from the catalog</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white border rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                              <p className="text-xs sm:text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                            </div>
                            <span className="font-bold text-base sm:text-lg text-blue-600 ml-2">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="px-3 sm:px-4 py-1.5 bg-white font-medium min-w-[40px] text-center text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
                    <span className="text-lg sm:text-xl font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Tax (8%)</span>
                    <span className="text-base sm:text-lg font-medium text-gray-800">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-300">
                    <span className="text-lg sm:text-xl font-bold text-gray-800">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer - Action Buttons */}
          {cart.length > 0 && (
            <div className="border-t p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* First Row of Actions */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={handleOpenDrawer}
                  className="flex items-center justify-center py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                >
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="truncate">Cash Drawer</span>
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center justify-center py-2 sm:py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm sm:text-base"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="truncate">Print Receipt</span>
                </button>
              </div>
              
              {/* Second Row of Actions */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={handleGeneratePDF}
                  className="flex items-center justify-center py-2 sm:py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm sm:text-base"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="truncate">Generate PDF</span>
                </button>
                <button
                  onClick={handleExportBill}
                  className="flex items-center justify-center py-2 sm:py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="truncate">Export Bill</span>
                </button>
              </div>
              
              {/* Payment Button */}
              <button
                onClick={handleProcessPayment}
                className="w-full flex items-center justify-center py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <span>Pay ${total.toFixed(2)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;