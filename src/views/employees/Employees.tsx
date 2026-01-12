import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Printer,
  Upload,
  User,
  Key,
  Image
} from 'lucide-react';
import api from '../../utils/services/axios';
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'staff';
  status: boolean;
  default_role_route: string;
  profile_image: string | null;
  created_at?: string;
  updated_at?: string;
  err: string | null;
}

interface EmployeesResponse {
  data: Employee[];
}

interface ProtectedComponentProps {
  allowedRoles: ('admin' | 'manager' | 'cashier' | 'staff')[];
  currentRole: 'admin' | 'manager' | 'cashier' | 'staff';
  children: React.ReactNode;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  allowedRoles,
  currentRole,
  children
}) => {
  if (!allowedRoles.includes(currentRole)) {
    return null;
  }
  return <>{children}</>;
};

const Employees = () => {
  const { user } = useAuth();
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // Added for Eye button
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier' | 'staff',
    status: true,
    profile_image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch employees data
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get<EmployeesResponse>('/users');
      setEmployeesData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees data:', err);
      setError('Failed to load employees data');
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employeesData.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle employee selection
  const toggleEmployeeSelection = (id: number) => {
    setSelectedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(employeeId => employeeId !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(employee => employee.id));
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'cashier':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier',
      status: true,
      profile_image: null
    });
    setImagePreview(null);
  };

  // Handle add employee
const handleAddEmployee = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("status", formData.status ? "1" : "0");

    if (formData.profile_image) {
      formDataToSend.append("profile_image", formData.profile_image);
    }

    await api.post("/users", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Employee added successfully!", {
      position: "top-right",
      autoClose: 3000,
      theme: "light",
      transition: Bounce,
    });

    setShowAddModal(false);
    resetForm();
    fetchEmployees();

  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    const errorMessage =
      err.response?.data?.message || "Failed to add employee";

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      theme: "light",
      transition: Bounce,
    });

    console.error("Error adding employee:", err);
  }
};



  // Handle edit employee
const handleEditEmployee = async () => {
  if (!selectedEmployee) return;

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("status", formData.status ? "1" : "0");

    if (formData.profile_image) {
      formDataToSend.append("profile_image", formData.profile_image);
    }

    await api.post(`/users/${selectedEmployee.id}`, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Employee updated successfully!", {
      position: "top-right",
      autoClose: 3000,
      theme: "light",
      transition: Bounce,
    });

    setShowEditModal(false);
    resetForm();
    setSelectedEmployee(null);
    fetchEmployees();

  } catch (error) {
    // TypeScript-safe handling
    const err = error as AxiosError<{ message?: string }>;
    const errorMessage =
      err.response?.data?.message || "Failed to update employee";

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      theme: "light",
      transition: Bounce,
    });

    console.error("Error updating employee:", err);
  }
};

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await api.delete(`/users/${selectedEmployee.id}`);
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    }
  };

  // Open view modal (for Eye button)
  const openViewModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Open edit modal
  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Don't show password
      role: employee.role,
      status: employee.status,
      profile_image: null
    });
    setImagePreview(employee.profile_image);
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees data...</p>
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
        <ToastContainer />
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Employees</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <ProtectedComponent
              allowedRoles={['admin', 'manager']}
              currentRole={user.role}
            >
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Printer className="w-4 h-4" />
                Print
              </button>
            </ProtectedComponent>
            <ProtectedComponent
              allowedRoles={['admin', 'manager']}
              currentRole={user.role}
            >
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </ProtectedComponent>
            <ProtectedComponent
              allowedRoles={['admin']}
              currentRole={user.role}
            >
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <UserPlus className="w-4 h-4" />
                Add Employee
              </button>
            </ProtectedComponent>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-green-600 font-medium">Total</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{employeesData.length}</h3>
          <p className="text-gray-600 text-sm">Total Employees</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Active</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
            {employeesData.filter(e => e.status).length}
          </h3>
          <p className="text-gray-600 text-sm">Active Employees</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-red-100">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Admins</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
            {employeesData.filter(e => e.role === 'admin').length}
          </h3>
          <p className="text-gray-600 text-sm">Administrators</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <Key className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Managers</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
            {employeesData.filter(e => e.role === 'manager').length}
          </h3>
          <p className="text-gray-600 text-sm">Store Managers</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <ProtectedComponent
              allowedRoles={['admin', 'manager']}
              currentRole={user.role}
            >
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </ProtectedComponent>
            <ProtectedComponent
              allowedRoles={['admin', 'manager']}
              currentRole={user.role}
            >
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                Import
              </button>
            </ProtectedComponent>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 md:p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Employee List</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employeesData.length} employees
            </span>
            {selectedEmployees.length > 0 && (
              <span className="text-sm text-blue-600">
                {selectedEmployees.length} selected
              </span>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <ProtectedComponent
                  allowedRoles={['admin']}
                  currentRole={user.role}
                >
                  <th className="w-12 p-3 md:p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                </ProtectedComponent>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Employee</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Contact</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Role</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={user.role === 'admin' ? 6 : 5} className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No employees found</p>
                    {searchTerm && (
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <ProtectedComponent
                      allowedRoles={['admin']}
                      currentRole={user.role}
                    >
                      <td className="p-3 md:p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                        />
                      </td>
                    </ProtectedComponent>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {employee.profile_image ? (
                            <img 
                              src={employee.profile_image} 
                              alt={employee.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{employee.name}</p>
                          <p className="text-xs text-gray-500">ID: EMP-{employee.id.toString().padStart(3, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDate(employee.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2">
                        {employee.status ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openViewModal(employee)}
                          className="p-1 hover:bg-gray-100 rounded" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <ProtectedComponent
                          allowedRoles={['admin']}
                          currentRole={user.role}
                        >
                          <button 
                            onClick={() => openEditModal(employee)}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent
                          allowedRoles={['admin']}
                          currentRole={user.role}
                        >
                          <button 
                            onClick={() => openDeleteModal(employee)}
                            className="p-1 hover:bg-gray-100 rounded" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </ProtectedComponent>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      {user.role === 'admin' && selectedEmployees.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg p-4 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
              Export Selected
            </button>
            <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
              Delete Selected
            </button>
            <button 
              onClick={() => setSelectedEmployees([])}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* View Employee Modal (for Eye button) */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">Employee Details</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                  {selectedEmployee.profile_image ? (
                    <img 
                      src={selectedEmployee.profile_image} 
                      alt={selectedEmployee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h4 className="text-xl font-bold text-gray-800">{selectedEmployee.name}</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(selectedEmployee.role)}`}>
                  {selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedEmployee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${selectedEmployee.status ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-medium ${selectedEmployee.status ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedEmployee.status ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(selectedEmployee.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{formatDate(selectedEmployee.updated_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Default Route</p>
                    <p className="font-medium">{selectedEmployee.default_role_route}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">Add New Employee</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Upload Image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                  id="status-checkbox"
                />
                <label htmlFor="status-checkbox" className="ml-2 text-sm text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">Edit Employee</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Change Image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                  id="edit-status-checkbox"
                />
                <label htmlFor="edit-status-checkbox" className="ml-2 text-sm text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">Delete Employee</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedEmployee.profile_image ? (
                    <img 
                      src={selectedEmployee.profile_image} 
                      alt={selectedEmployee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                </div>
              </div>
              <p className="text-gray-600">
                Are you sure you want to delete this employee? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;