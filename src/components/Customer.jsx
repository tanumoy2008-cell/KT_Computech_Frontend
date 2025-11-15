import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaRegEdit, 
  FaTrashAlt, 
  FaUserPlus,
  FaSpinner
} from 'react-icons/fa';
import axios from '../config/axios';

const Customer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState({
    customers: true,
    action: null, // 'editing', 'deleting', 'adding'
    id: null // ID of the item being processed
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    status: 'active'
  });

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      const response = await axios.get('/api/customer', {
        params: {
          page: currentPage,
          limit: customersPerPage,
          search: searchTerm.trim()
        },
        headers: {
          'x-admin-token': localStorage.getItem('adminToken')
        }
      });
      
      const { users, pagination } = response.data.data;
      setCustomers(users);
      setTotalPages(pagination.pages);
      setTotalCustomers(pagination.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load customers';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      
      // Reset to first page on error
      if (currentPage > 1) {
        setCurrentPage(1);
      }
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  }, [currentPage, customersPerPage, searchTerm]);

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    const controller = new AbortController();
    
    fetchCustomers();
    
    return () => {
      controller.abort();
    };
  }, [fetchCustomers]);

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // No need for client-side filtering/pagination as it's handled by the backend
  const currentCustomers = customers;

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle edit button click
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.fullName?.firstName || '',
      lastName: customer.fullName?.lastName || '',
      email: customer.email || '',
      phoneNumber: customer.phoneNumber || '',
      status: customer.status || 'active'
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading({ action: 'editing', id: editingCustomer._id });
      
      const { data } = await axios.patch(
        `/api/customer/${editingCustomer._id}`,
        { 
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          status: formData.status
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': localStorage.getItem('adminToken')
          }
        }
      );
      
      toast.success(data.message || 'Customer updated successfully');
      
      // Update the customer in the list
      setCustomers(prev => 
        prev.map(c => 
          c._id === editingCustomer._id 
            ? { 
                ...c, 
                ...data.data,
                fullName: {
                  firstName: formData.firstName,
                  lastName: formData.lastName
                }
              } 
            : c
        )
      );
      
      // Reset form and editing state
      setEditingCustomer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        status: 'active'
      });
      
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update customer';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      return false;
    } finally {
      setLoading({ action: null, id: null });
    }
  };

  // Handle customer delete
  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading({ action: 'deleting', id: customerId });
      
      const { data } = await axios.delete(`/api/customer/${customerId}`, {
        headers: {
          'x-admin-token': localStorage.getItem('adminToken')
        }
      });
      
      toast.success(data.message || 'Customer deleted successfully');
      
      // If we're on the last page with only one item, go to previous page
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => {
          const newPage = Math.max(1, prev - 1);
          // Fetch customers for the new page
          setTimeout(() => {
            setCurrentPage(newPage);
          }, 0);
          return newPage;
        });
      } else {
        // Just remove the customer from the list
        setCustomers(prev => prev.filter(c => c._id !== customerId));
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete customer';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
    } finally {
      setLoading({ action: null, id: null });
    }
  };

  if (loading.customers && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Edit Customer</h3>
                <button 
                  onClick={() => setEditingCustomer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading.action === 'editing'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center min-w-20"
                    disabled={loading.action === 'editing'}
                  >
                    {loading.action === 'editing' && loading.id === editingCustomer._id ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <p className="text-gray-600">Manage your customers and their details</p>
        </div>
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentCustomers.length > 0 ? (
              currentCustomers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName?.firstName} {customer.fullName?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {customer._id?.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {customer.email || 'N/A'}
                      </div>
                      <div className="flex items-center mt-1">
                        <FaPhone className="mr-2 text-gray-400" />
                        {customer.phoneNumber || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {customer.orderHistory?.length || 0} orders
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (customer.status || 'inactive') === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(customer.status || 'inactive').charAt(0).toUpperCase() + (customer.status || 'inactive').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit"
                      disabled={loading.action && loading.id !== customer._id}
                    >
                      {loading.action === 'editing' && loading.id === customer._id ? (
                        <FaSpinner className="inline animate-spin" />
                      ) : (
                        <FaRegEdit className="inline" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                      disabled={loading.action && loading.id !== customer._id}
                    >
                      {loading.action === 'deleting' && loading.id === customer._id ? (
                        <FaSpinner className="inline animate-spin" />
                      ) : (
                        <FaTrashAlt className="inline" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-6 py-3 bg-gray-50 rounded-b-lg">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">
                {Math.min((currentPage - 1) * customersPerPage + 1, totalCustomers)}
              </span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * customersPerPage, totalCustomers)}
              </span>{' '}
              of <span className="font-medium">{totalCustomers}</span> customers
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show page numbers with ellipsis for many pages
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
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 py-1">...</span>
            )}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
