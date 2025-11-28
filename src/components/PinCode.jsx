import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaTimes, 
  FaFilter, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaTimes as FaX
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const initialFormData = {
  pinCode: '',
  city: '',
  state: '',
  area: '',
  region: '',
  deliveryDays: 3,
  codAvailable: true,
  isActive: true
};

// Status Badge Component
const StatusBadge = ({ isActive }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// Toggle Switch Component
const ToggleSwitch = ({ isOn, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isOn ? 'bg-blue-600' : 'bg-gray-300'}`}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
  </div>
);

// Empty State Component
const EmptyState = ({ message, action }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-1-5h1m4 0h1m-9 8h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v12a3 3 0 003 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-500">{message}</h3>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaPlus className="mr-2" />
        {action.label}
      </button>
    )}
  </div>
);

const PinCode = () => {
  // State
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ ...initialFormData });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    city: '',
    state: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  const [sortConfig, setSortConfig] = useState({ 
    key: 'createdAt', 
    direction: 'desc' 
  });

  // Fetch pincodes from API with memoization
  const fetchPincodes = useCallback(async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const { search, isActive, city, state } = filters;
      
      // Build query params
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(isActive !== '' && { isActive: isActive === 'true' }),
        ...(city && { city }),
        ...(state && { state }),
        sortBy: `${sortConfig.key}:${sortConfig.direction}`
      };
      
      const response = await axios.get('/api/pinCode', { params });
      
      setPincodes(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: Math.ceil((response.data.total || 0) / limit)
      }));
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch pincodes');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters, sortConfig, pagination.limit]);

  // Fetch pincodes when component mounts or filters/sort/pagination changes
  useEffect(() => {
    fetchPincodes();
  }, [fetchPincodes]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      isActive: '',
      city: '',
      state: ''
    });
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 text-blue-600" /> 
      : <FaSortDown className="ml-1 text-blue-600" />;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        // For update, create a copy of formData without the pinCode field
        const { pinCode, ...updateData } = formData;
        await axios.put(`/api/pinCode/${editingId}`, updateData);
        toast.success('Pincode updated successfully');
      } else {
        // Create new pincode (include all fields including pinCode)
        await axios.post('/api/pinCode', formData);
        toast.success('Pincode added successfully');
      }
      
      // Reset form and refresh data
      setShowForm(false);
      setEditingId(null);
      setFormData({ ...initialFormData });
      await fetchPincodes();
    } catch (error) {
      console.error('Error saving pincode:', error);
      toast.error(error.response?.data?.message || 'Failed to save pincode');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (pincode) => {
    setEditingId(pincode._id);
    setFormData({
      pinCode: pincode.pinCode,
      city: pincode.city,
      state: pincode.state,
      area: pincode.area || '',
      region: pincode.region || '',
      deliveryDays: pincode.deliveryDays || 3,
      codAvailable: pincode.codAvailable,
      isActive: pincode.isActive
    });
    setShowForm(true);
    
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById('pincode-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle delete
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/pinCode/${id}`);
        toast.success('Pincode deleted successfully');
        await fetchPincodes();
      } catch (error) {
        console.error('Error deleting pincode:', error);
        toast.error(error.response?.data?.message || 'Failed to delete pincode');
      }
    }
  };

  // Toggle pincode status
  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/pinCode/${id}/status`, { isActive: !currentStatus });
      toast.success(`Pincode ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchPincodes();
    } catch (error) {
      console.error('Error toggling pincode status:', error);
      toast.error(error.response?.data?.message || 'Failed to update pincode status');
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...initialFormData });
    setShowForm(false);
  };

  // Render the component
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pincode Management</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ ...initialFormData });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          {showForm ? 'Cancel' : 'Add New Pincode'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={toggleFilters}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showFilters ? <FaTimes className="mr-1" /> : <FaFilter className="mr-1" />}
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by pincode, city, state..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Filter by city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
                placeholder="Filter by state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mr-2"
              >
                Clear Filters
              </button>
              <button
                onClick={fetchPincodes}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div id="pincode-form" className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Pincode' : 'Add New Pincode'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a valid 6-digit pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Days *</label>
                <input
                  type="number"
                  name="deliveryDays"
                  min="1"
                  value={formData.deliveryDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-6">
                  <input
                    type="checkbox"
                    id="codAvailable"
                    name="codAvailable"
                    checked={formData.codAvailable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="codAvailable" className="ml-2 block text-sm text-gray-700">
                    COD Available
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingId ? 'Update Pincode' : 'Add Pincode'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pincodes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pincodes.length === 0 ? (
            <EmptyState
              message="No pincodes found"
              action={{
                onClick: () => setShowForm(true),
                label: 'Add New Pincode'
              }}
            />
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('pinCode')}
                    >
                      <div className="flex items-center">
                        Pincode
                        {getSortIndicator('pinCode')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center">
                        City
                        {getSortIndicator('city')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('state')}
                    >
                      <div className="flex items-center">
                        State
                        {getSortIndicator('state')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Area
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('deliveryDays')}
                    >
                      <div className="flex items-center">
                        Delivery Days
                        {getSortIndicator('deliveryDays')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      COD
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pincodes.map((pincode) => (
                    <tr key={pincode._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pincode.pinCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pincode.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pincode.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pincode.area || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pincode.deliveryDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pincode.codAvailable ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge isActive={pincode.isActive} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(pincode)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(pincode._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          <ToggleSwitch
                            isOn={pincode.isActive}
                            onToggle={() => toggleStatus(pincode._id, pincode.isActive)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">First</span>
                          <FaArrowLeft className="h-4 w-4" />
                          <FaArrowLeft className="h-4 w-4 -ml-1" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FaArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === pagination.totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FaArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.page === pagination.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === pagination.totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Last</span>
                          <FaArrowRight className="h-4 w-4" />
                          <FaArrowRight className="h-4 w-4 -mr-1" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinCode;