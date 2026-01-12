import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  DollarSign,
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
  Utensils,
  User,
  Receipt,
  CheckCircle,
  Building,
  MapPin,
  // CreditCard,
  ArrowRight,
  Download,
  // Printer
} from 'lucide-react';
import api from '../../utils/services/axios';
import jsPDF from 'jspdf';
import { useAuth } from "../../context/AuthContext";


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

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  gstNumber?: string;
}

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

interface OrderPayload {
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
}

const PosApp = () => {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { user } = useAuth();

  const COMPANY_INFO = {
    name: user.company_name || "PayPoint Solutions",
    address: user.location || "123 Main Street, Cityville, Country",
    phone: user.phone || "+1 (555) 123-4567",
    email: user.email || "info@paypoint.com",
    website: user.website || "www.paypoint.com",
    gstNumber: user.gst_number || "GSTIN123456789",
    companyLogo: "/logo.png"
  };

  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer data state
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    gstNumber: ''
  });

  // Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  console.log(orderId);

  // Bill reference
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [billTime, setBillTime] = useState('');

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

  // Generate bill number and date
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setBillNumber(`INV-${dateStr}-${randomNum}`);
    setBillDate(now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    setBillTime(now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>('/products');

        const transformedProducts: Product[] = response.data.products.map(product => {
          const color = getCategoryColor(product.category.name);
          const imageUrl = product.product_image || getDefaultImage(product.category.name);

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

        const uniqueCategories = generateDynamicCategories(transformedProducts);
        setCategories([
          { name: 'All', icon: Home, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', activeColor: 'bg-gray-800 text-white' },
          ...uniqueCategories
        ]);

        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        const fallbackProducts = getFallbackProducts();
        setProducts(fallbackProducts);

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

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.18; // 18% GST
  const tax = subtotal * taxRate;
  const discount = 0;
  const total = subtotal + tax - discount;

  // Helper functions
  const generateDynamicCategories = (products: Product[]): Category[] => {
    const uniqueCategoryNames = Array.from(new Set(products.map(p => p.category)));

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

    const defaultConfig = {
      icon: Box,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      activeColor: 'bg-gray-600 text-white'
    };

    return categoryMap[categoryName] || defaultConfig;
  };

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
          image: product.image || getDefaultImage(product.category)
        }];
      }
    });

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
    setOrderId(null);
  };

  // Handle customer data input change
  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate PDF Bill without jspdf-autotable
  const generatePDFBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items to generate a bill.');
      return;
    }

    setShowCustomerModal(true);
  };

  // Save order to API
  const saveOrderToAPI = async (): Promise<number | null> => {
    try {
      const orderPayload: OrderPayload = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: discount,
        total: parseFloat(total.toFixed(2)),
        payment_method: 'cash',
        customer_name: customerData.name || null,
        customer_email: customerData.email || null,
        customer_phone: customerData.phone || null
      };

      const response = await api.post('/orders/', orderPayload);

      if (response.data && response.data.id) {
        return response.data.id;
      }
      return null;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  const handleGeneratePDF = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items to generate a bill.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // First, save the order to the API
      let savedOrderId: number | null = null;
      try {
        savedOrderId = await saveOrderToAPI();
        setOrderId(savedOrderId);
      } catch (apiError) {
        console.error('Failed to save order to API, generating PDF anyway:', apiError);
        // Continue with PDF generation even if API fails
      }

      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set margins
      const marginLeft = 15;
      const marginRight = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - marginLeft - marginRight;

      // Add company header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175); // Blue color
      doc.text(COMPANY_INFO.name, pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99); // Gray color
      doc.text(COMPANY_INFO.address, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}`, pageWidth / 2, 33, { align: 'center' });
      doc.text(`GST: ${COMPANY_INFO.gstNumber}`, pageWidth / 2, 38, { align: 'center' });

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, 45, pageWidth - marginRight, 45);

      // Invoice title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('TAX INVOICE', pageWidth / 2, 55, { align: 'center' });

      // Invoice details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Left column - Invoice details
      const invoiceNumber = savedOrderId ? `ORD-${savedOrderId.toString().padStart(4, '0')}` : billNumber;
      doc.text(`Invoice No: ${invoiceNumber}`, marginLeft, 65);
      doc.text(`Date: ${billDate}`, marginLeft, 70);
      doc.text(`Time: ${billTime}`, marginLeft, 75);

      // Right column - Customer details
      const customerStartX = pageWidth - marginRight - 80;
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', customerStartX, 65);
      doc.setFont('helvetica', 'normal');

      let customerY = 70;
      if (customerData.name) {
        doc.text(`Name: ${customerData.name}`, customerStartX, customerY);
        customerY += 5;
      }
      if (customerData.phone) {
        doc.text(`Phone: ${customerData.phone}`, customerStartX, customerY);
        customerY += 5;
      }
      if (customerData.email) {
        doc.text(`Email: ${customerData.email}`, customerStartX, customerY);
        customerY += 5;
      }
      if (customerData.gstNumber) {
        doc.text(`GST No: ${customerData.gstNumber}`, customerStartX, customerY);
      }

      // Table header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(30, 64, 175);

      // Draw table header background
      doc.rect(marginLeft, 85, contentWidth, 8, 'F');

      // Add header text
      doc.setTextColor(255, 255, 255);
      doc.text('Sr No.', marginLeft + 5, 90);
      doc.text('Item Description', marginLeft + 20, 90);
      doc.text('Qty', marginLeft + contentWidth - 60, 90);
      doc.text('Unit Price', marginLeft + contentWidth - 45, 90);
      doc.text('Total', marginLeft + contentWidth - 20, 90, { align: 'right' });

      // Add cart items
      let startY = 95;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      cart.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // Gray-50
          doc.rect(marginLeft, startY - 3, contentWidth, 10, 'F');
        }

        // Serial number
        doc.text((index + 1).toString(), marginLeft + 5, startY);

        // Item name (with truncation)
        const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
        doc.text(itemName, marginLeft + 20, startY);

        // Quantity
        doc.text(item.quantity.toString(), marginLeft + contentWidth - 60, startY);

        // Unit price
        doc.text(`$${item.price.toFixed(2)}`, marginLeft + contentWidth - 45, startY);

        // Total
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, marginLeft + contentWidth - 20, startY, { align: 'right' });

        startY += 10;
      });

      // Add bottom border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(marginLeft, startY, pageWidth - marginRight, startY);
      startY += 5;

      // Add totals section
      const totalsStartX = pageWidth - marginRight - 60;

      // Subtotal
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', totalsStartX, startY);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - marginRight, startY, { align: 'right' });
      startY += 6;

      // Tax
      doc.text(`Tax (${(taxRate * 100).toFixed(0)}%):`, totalsStartX, startY);
      doc.text(`$${tax.toFixed(2)}`, pageWidth - marginRight, startY, { align: 'right' });
      startY += 6;

      // Grand Total
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('GRAND TOTAL:', totalsStartX, startY);
      doc.text(`$${total.toFixed(2)}`, pageWidth - marginRight, startY, { align: 'right' });

      // Add horizontal line
      startY += 8;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(totalsStartX - 5, startY, pageWidth - marginRight, startY);

      // Add payment method and order ID
      startY += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Method: Cash', marginLeft, startY);
      doc.text(`Payment Status: Paid`, marginLeft, startY + 5);
      if (savedOrderId) {
        doc.text(`Order ID: ORD-${savedOrderId.toString().padStart(4, '0')}`, marginLeft, startY + 10);
      }

      // Add footer notes
      startY = pageHeight - 40;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', pageWidth / 2, startY, { align: 'center' });
      doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, startY + 5, { align: 'center' });
      doc.text('For any queries, please contact: ' + COMPANY_INFO.phone, pageWidth / 2, startY + 10, { align: 'center' });

      // Terms and conditions
      doc.text('Terms & Conditions:', marginLeft, startY + 20);
      doc.text('1. Goods once sold cannot be returned or exchanged.', marginLeft + 5, startY + 25);
      doc.text('2. All disputes are subject to jurisdiction of local courts.', marginLeft + 5, startY + 30);

      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(marginLeft - 5, 10, pageWidth - marginLeft - marginRight + 10, pageHeight - 55);

      // Save the PDF
      const customerName = customerData.name ? `_${customerData.name.replace(/\s+/g, '_')}` : '';
      const fileName = savedOrderId
        ? `Invoice_ORD-${savedOrderId.toString().padStart(4, '0')}${customerName}.pdf`
        : `Invoice_${billNumber}${customerName}.pdf`;

      doc.save(fileName);

      // Show success message
      const apiSuccess = savedOrderId ? ` (Order ID: ORD-${savedOrderId.toString().padStart(4, '0')})` : '';
      setSuccessMessage(`Invoice generated successfully: ${fileName}${apiSuccess}`);
      setShowSuccessMessage(true);

      // Reset customer modal
      setShowCustomerModal(false);

      // Clear success message after 5 seconds and clear cart
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear cart after successful PDF generation
        clearCart();
        // Reset customer data
        setCustomerData({
          name: '',
          email: '',
          phone: '',
          gstNumber: ''
        });
      }, 5000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      if (cart.length === 0) {
        alert('Cart is empty. Add items before processing payment.');
        return;
      }

      // Show customer modal for optional details
      setShowCustomerModal(true);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  // Get drawer width based on screen size
  const getDrawerWidth = () => {
    if (isMobile) return 'w-full';
    if (isTablet) return 'w-3/4';
    return 'w-[500px]';
  };

  // Truncate long text for cart items
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 bg-gray-50 min-h-screen max-w-full">
      {/* Header Section */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-6 h-6 mr-2 text-gray-800" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">PayPoint POS - {COMPANY_INFO.name}</h1>
                <span className="m-4 h-12 w-12 rounded-full overflow-hidden flex justify-center items-center cursor-pointer hover:bg-lightprimary">

                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />

                </span>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center px-3 py-4 bg-primary text-white rounded-md transition-colors"
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
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {COMPANY_INFO.address}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all ${isActive
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

          {/* Product Grid */}
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
                            (e.target as HTMLImageElement).src = getDefaultImage(product.category);
                          }}
                        />
                      </div>
                      <h4 className="font-bold text-gray-800 line-clamp-2 mb-1 sm:mb-2 text-sm sm:text-base">{product.name}</h4>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white rounded-full text-gray-600">
                          {product.category}
                        </span>
                        <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold ${product.stock > 20
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
      <div className={`fixed top-0 right-0 h-screen ${getDrawerWidth()} bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
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

          {/* Cart Items - Fixed Height with Scroll */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              {cart.length === 0 ? (
                <div className="py-8 sm:py-12 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No items in cart</p>
                  <p className="text-xs sm:text-sm">Add products from the catalog</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white border rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-2">
                              <p className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 break-words">
                                {truncateText(item.name, 50)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">${item.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="font-bold text-base sm:text-lg text-blue-600 block text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, item.quantity - 1);
                                }}
                                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="px-3 sm:px-4 py-1.5 bg-white font-medium min-w-[40px] text-center text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, item.quantity + 1);
                                }}
                                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
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
                    <span className="text-gray-600 text-sm sm:text-base">Tax (18%)</span>
                    <span className="text-base sm:text-lg font-medium text-gray-800">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-300">
                    <span className="text-lg sm:text-xl font-bold text-gray-800">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Bill Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center mb-2">
                    <Receipt className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Bill Information</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Bill No:</span>
                      <span className="font-medium">{billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{billDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer - Single Pay Now Button */}
          {cart.length > 0 && (
            <div className="border-t p-4 sm:p-6">
              <div className="space-y-3">
                <button
                  onClick={handleProcessPayment}
                  className="w-full flex items-center justify-center py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all group"
                >
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  <span>Pay ${total.toFixed(2)} Now</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Additional Options */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={generatePDFBill}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Generate Bill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Data Modal - Appears when clicking Pay Now */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Complete Payment</h3>
                    <p className="text-sm text-gray-600">Enter customer details (Optional)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isGeneratingPDF}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{cart.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-green-600 text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerData.gstNumber}
                    onChange={(e) => handleCustomerDataChange('gstNumber', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="GSTINXXXXXXXXXX"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing Order & Generating Invoice...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Process Order & Download Invoice
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowCustomerModal(false)}
                  disabled={isGeneratingPDF}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {/* Company Info Preview */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <Building className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Invoice will include:</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Company: {COMPANY_INFO.name}</p>
                  <p>• Address: {COMPANY_INFO.address}</p>
                  <p>• GST: {COMPANY_INFO.gstNumber}</p>
                  <p>• Invoice No: {billNumber}</p>
                  <p>• Date: {billDate} | Time: {billTime}</p>
                  <p>• Total Items: {cart.length}</p>
                  <p>• Total Amount: ${total.toFixed(2)}</p>
                  <p className="text-blue-600 font-medium">• Order will be saved to database</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosApp;