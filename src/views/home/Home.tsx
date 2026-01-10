import { useState } from 'react';
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
  Wine,
  Apple,
  Carrot,
  Milk,
  Beef,
  Pizza
} from 'lucide-react';

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

const HomePage = () => {
  // Mock data for POS status
  const posStatus = {
    isOnline: true,
    currentShift: 'Morning Shift (8:00 AM - 4:00 PM)',
    cashier: 'John Doe',
    registerBalance: 12500.75,
    pendingOrders: 3,
    lowStockItems: 7,
    todaySales: 42,
    dailyRevenue: 8450.50
  };

  // Supermarket product data with actual image URLs from Unsplash
  const products: Product[] = [
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
    },
    { 
      id: 5, 
      name: 'Brown Eggs', 
      category: 'Dairy', 
      price: 5.49, 
      stock: 24, 
      barcode: '123456793',
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop',
      color: 'bg-amber-50 border-amber-100'
    },
    { 
      id: 6, 
      name: 'Ground Beef', 
      category: 'Meat', 
      price: 8.99, 
      stock: 18, 
      barcode: '123456794',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      color: 'bg-rose-50 border-rose-100'
    },
    { 
      id: 8, 
      name: 'Fresh Bread', 
      category: 'Bakery', 
      price: 3.49, 
      stock: 56, 
      barcode: '123456796',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      color: 'bg-amber-50 border-amber-100'
    },
    { 
      id: 9, 
      name: 'Bottled Water', 
      category: 'Beverages', 
      price: 0.99, 
      stock: 120, 
      barcode: '123456797',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop',
      color: 'bg-sky-50 border-sky-100'
    },
    { 
      id: 10, 
      name: 'Orange Juice', 
      category: 'Beverages', 
      price: 4.49, 
      stock: 38, 
      barcode: '123456798',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
      color: 'bg-orange-50 border-orange-100'
    },
    { 
      id: 11, 
      name: 'Coffee Beans', 
      category: 'Beverages', 
      price: 12.99, 
      stock: 15, 
      barcode: '123456799',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      color: 'bg-brown-50 border-brown-100'
    },
    { 
      id: 13, 
      name: 'Tomato Sauce', 
      category: 'Pantry', 
      price: 3.29, 
      stock: 28, 
      barcode: '123456801',
      image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop',
      color: 'bg-red-50 border-red-100'
    },
    { 
      id: 14, 
      name: 'Cheddar Cheese', 
      category: 'Dairy', 
      price: 6.99, 
      stock: 19, 
      barcode: '123456802',
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop',
      color: 'bg-yellow-50 border-yellow-100'
    },
    { 
      id: 15, 
      name: 'Fresh Salmon', 
      category: 'Seafood', 
      price: 14.99, 
      stock: 8, 
      barcode: '123456803',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      color: 'bg-pink-50 border-pink-100'
    },
    { 
      id: 16, 
      name: 'Frozen Pizza', 
      category: 'Frozen', 
      price: 6.49, 
      stock: 35, 
      barcode: '123456804',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      color: 'bg-rose-50 border-rose-100'
    }
  ];

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: 'Fresh Apples', price: 3.99, quantity: 2, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop' },
    { id: 6, name: 'Ground Beef', price: 8.99, quantity: 1, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
    { id: 9, name: 'Bottled Water', price: 0.99, quantity: 6, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  // Categories with icons and colors
  const categories: Category[] = [
    { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' },
    { name: 'Fruits', icon: Apple, color: 'bg-red-100 text-red-800 hover:bg-red-200', activeColor: 'bg-red-600 text-white' },
    { name: 'Vegetables', icon: Carrot, color: 'bg-green-100 text-green-800 hover:bg-green-200', activeColor: 'bg-green-600 text-white' },
    { name: 'Dairy', icon: Milk, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', activeColor: 'bg-blue-600 text-white' },
    { name: 'Meat', icon: Beef, color: 'bg-rose-100 text-rose-800 hover:bg-rose-200', activeColor: 'bg-rose-600 text-white' },
    { name: 'Bakery', icon: ShoppingBag, color: 'bg-amber-100 text-amber-800 hover:bg-amber-200', activeColor: 'bg-amber-600 text-white' },
    { name: 'Beverages', icon: Coffee, color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', activeColor: 'bg-orange-600 text-white' },
    { name: 'Pantry', icon: Package, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', activeColor: 'bg-yellow-600 text-white' },
    { name: 'Seafood', icon: Wine, color: 'bg-pink-100 text-pink-800 hover:bg-pink-200', activeColor: 'bg-pink-600 text-white' },
    { name: 'Frozen', icon: Pizza, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', activeColor: 'bg-purple-600 text-white' },
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
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

  const handleProcessPayment = () => {
    alert(`Processing payment of $${total.toFixed(2)}`);
    // Payment processing logic
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Supermarket POS</h1>
            <div className="flex items-center mt-2">
              <div className={`flex items-center px-3 py-1 rounded-full ${posStatus.isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${posStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {posStatus.isOnline ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <span className="ml-4 text-gray-600 text-sm">
                {posStatus.currentShift} • Cashier: {posStatus.cashier}
              </span>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-xl font-bold text-green-600">${posStatus.dailyRevenue.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-bold text-blue-600">{posStatus.todaySales}</p>
            </div>
          </div>
        </div>
      </div>

      {/* POS Interface View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Shopping Cart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-blue-600" />
                Current Sale
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={clearCart}
                  className="flex items-center px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Clear Cart
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print Receipt
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="border rounded-xl overflow-hidden mb-6">
              <div className="grid grid-cols-12 bg-gradient-to-r from-gray-50 to-gray-100 p-4 font-semibold text-gray-700">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No items in cart</p>
                    <p className="text-sm">Start by adding products from the catalog</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 transition-colors">
                      <div className="col-span-5">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <div className="flex items-center">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="mt-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                              >
                                <X className="w-3 h-3 inline mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center flex items-center justify-center">
                        <span className="font-medium text-gray-800">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 bg-white font-medium min-w-[60px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2 text-center flex items-center justify-center">
                        <span className="font-bold text-lg text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-xl font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="text-lg font-medium text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                  <span className="text-2xl font-bold text-gray-800">Total Amount</span>
                  <span className="text-3xl font-bold text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleOpenDrawer}
                  className="flex items-center justify-center py-3.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Open Drawer
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={cart.length === 0}
                  className={`flex items-center justify-center py-3.5 rounded-xl font-bold text-lg ${
                    cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mr-2" />
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Catalog */}
        <div className="col-span-12 lg:col-span-4">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? `${category.activeColor} shadow-md transform scale-105` 
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

          {/* Product Grid */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Product Catalog</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredProducts.length} products
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-1">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`border rounded-xl p-3 hover:shadow-lg transition-all duration-300 cursor-pointer ${product.color}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-3">
                      <div className="h-32 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-bold text-gray-800 line-clamp-2 mb-1 text-sm">{product.name}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 bg-white rounded-full text-gray-600">
                          {product.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
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
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Price</span>
                          <p className="font-bold text-lg text-gray-800">${product.price.toFixed(2)}</p>
                        </div>
                        <button className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:shadow-lg hover:bg-blue-50 hover:text-blue-600 transition-all group">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm">Try a different search term or category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;