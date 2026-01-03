import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FaSearch, FaFilter, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { env } from "../config/key";

const ITEMS_PER_PAGE = 10;
const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled", label: "Cancelled" },
  { key: "Returned", label: "Returned" }
];

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState(null);

  const tokenFromStore = useSelector(state => state?.auth?.token);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      };
      
      // Remove undefined values from params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const authToken = tokenFromStore || localStorage.getItem('token');
      const response = await axios.get("/api/orders", {
        params,
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
          [env.VITE_ADMIN_TOKEN_NAME]: localStorage.getItem('adminToken')
        }
      });
      
      setOrders(response.data.orders || []);
      setTotalOrders(response.data.orders.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
      const errorMessage = error.response?.data?.message || "Failed to load orders. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, sortConfig, dateRange]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
    fetchOrders();
  }, [statusFilter, searchQuery, sortConfig, dateRange]);
  
  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            [env.VITE_ADMIN_TOKEN_NAME]: localStorage.getItem('adminToken')
          } 
        }
      );
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage = error.response?.data?.message || "Failed to update order status. Please try again.";
      toast.error(errorMessage);
    }
  };
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };
  
  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 text-blue-600" /> 
      : <FaSortDown className="ml-1 text-blue-600" />;
  };
  
  // Filter orders by payment mode
  const { onlineOrders, offlineOrders } = useMemo(() => {
    const online = orders.filter(o => o.paymentMode === "UPI" || o.paymentMode === "Online" || o.paymentMode === "Razorpay");
    const offline = orders.filter(o => !online.includes(o));
    return { onlineOrders: online, offlineOrders: offline };
  }, [orders]);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
  
  // Reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };
  
  // Check if any filter is active
  const isFilterActive = statusFilter !== "all" || searchQuery || dateRange.start || dateRange.end;

    // Format date for display
    const formatDate = (dateString) => {
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

    // Format currency
    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount).replace('₹', '₹');
    };

    // Get status color
    const getStatusColor = (status) => {
      switch (String(status || '').toLowerCase()) {
        case 'delivered':
          return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'shipped':
          return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case 'cancelled':
        case 'canceled':
          return { bg: 'bg-red-100', text: 'text-red-800' };
        case 'returned':
          return { bg: 'bg-purple-100', text: 'text-purple-800' };
        case 'processing':
          return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        default: // pending
          return { bg: 'bg-gray-100', text: 'text-gray-800' };
      }
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method) => {
      switch (String(method || '').toLowerCase()) {
        case 'upi':
          return '💸';
        case 'credit card':
        case 'debit card':
          return '💳';
        case 'netbanking':
          return '🏦';
        case 'wallet':
          return '👛';
        case 'cod':
        case 'cash on delivery':
          return '💵';
        default:
          return '💰';
      }
    };
  const renderOrderCard = (order) => (
    <motion.div 
      key={order._id} 
      className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ scale: 1.01 }}
      onClick={() => setSelectedOrder(order)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">Order: {order.orderNumber}</div>
          <div className="text-sm text-zinc-600">
            {formatDate(order.createdAt)}
          </div>
          {order.customer?.name && (
            <div className="text-sm mt-1">
              <span className="font-medium">Customer:</span> {order.customer.name}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold">{formatCurrency(order.total)}</div>
          <div className={`text-sm ${
            order.status === 'Completed' ? 'text-green-600' : 
            order.status === 'Cancelled' ? 'text-red-600' : 'text-amber-600'
          } font-medium`}>
            {order.status}
          </div>
          <div className="mt-1">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
              className="text-xs p-1 border rounded bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t">
        {order.items?.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <div className="truncate max-w-[180px]">
              {item.name} × {item.qty}
            </div>
            <div>{formatCurrency(item.total)}</div>
          </div>
        ))}
        {order.items?.length > 2 && (
          <div className="text-xs text-zinc-500 mt-1">
            +{order.items.length - 2} more items
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col px-4 md:px-6 py-4 w-full min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                isFilterActive 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter className="mr-2 h-4 w-4" />
              Filters
              {isFilterActive && (
                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs">
                  {[statusFilter !== "all" ? 1 : 0, searchQuery ? 1 : 0, dateRange.start || dateRange.end ? 1 : 0].filter(Boolean).length}
                </span>
              )}
            </button>
            
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {STATUS_FILTERS.map(filter => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <span className="flex items-center">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={dateRange.start}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Online Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{onlineOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Offline Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{offlineOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button
                  onClick={fetchOrders}
                  className="text-sm font-medium text-red-700 hover:text-red-600 transition duration-150 ease-in-out"
                >
                  Try again <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-sm text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isFilterActive 
              ? "No orders match your current filters. Try adjusting your search or filter criteria."
              : "Get started by creating a new order."}
          </p>
          {isFilterActive && (
            <div className="mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Cards for small screens */}
          <div className="sm:hidden grid gap-4 p-4">
            {orders.map(renderOrderCard)}
          </div>
          {/* Table for larger screens */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center">
                      Order #
                      {getSortIndicator('orderNumber')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {getSortIndicator('createdAt')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      {getSortIndicator('total')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.email || 'No email provided'}
                      </div>
                    </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 flex items-center space-x-2">
                                  <span>{getPaymentMethodIcon(order.paymentMode)}</span>
                                  <span>{order.paymentMode}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.paymentStatus || 'N/A'}
                                </div>
                              </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const sc = getStatusColor(order.status);
                        return (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                            {order.status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, e.target.value);
                          }}
                          className={`text-xs rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            order.status === 'Delivered' ? 'bg-green-50' :
                            order.status === 'Cancelled' ? 'bg-red-50' :
                            order.status === 'Shipped' ? 'bg-blue-50' :
                            'bg-yellow-50'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center px-4 py-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalOrders)}
                    </span>{' '}
                    of <span className="font-medium">{totalOrders}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">First</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Last</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <AnimatePresence>
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Order #{selectedOrder.orderNumber}</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                    <p><span className="font-medium">Status:</span> 
                      {(() => {
                        const sc = getStatusColor(selectedOrder.status);
                        return (
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${sc.bg} ${sc.text}`}>
                            {selectedOrder.status}
                          </span>
                        );
                      })()}
                    </p>
                    <p className="flex items-center"><span className="font-medium mr-2">Payment Method:</span> {getPaymentMethodIcon(selectedOrder.paymentMode)} {selectedOrder.paymentMode}</p>
                    {selectedOrder.razorpayOrderId && (
                      <p><span className="font-medium">Razorpay ID:</span> {selectedOrder.razorpayOrderId}</p>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mt-6 mb-2">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.customer?.name && (
                      <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                    )}
                    {selectedOrder.customer?.email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                    )}
                    {selectedOrder.customer?.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                    )}
                    {selectedOrder.customer?.address && (
                      <p className="mt-2">
                        <span className="font-medium block">Address:</span>
                        {selectedOrder.customer.address}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3 border-b last:border-b-0 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                            {item.colorVariantId?.name && (
                              <div className="flex items-center mt-1">
                                <span 
                                  className="w-4 h-4 rounded-full border border-gray-300 mr-1"
                                  style={{ backgroundColor: item.colorVariantId.colorCode }}
                                  title={item.colorVariantId.name}
                                />
                                <span className="text-xs text-gray-500">{item.colorVariantId.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total)}</p>
                          {item.off > 0 && (
                            <p className="text-xs text-green-600">
                              {item.off}% off
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subTotal)}</span>
                    </div>
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                    handleStatusUpdate(selectedOrder._id, newStatus);
                  }}
                  className="px-4 py-2 border rounded-md bg-white"
                >
                  <option value="Pending">Mark as Pending</option>
                  <option value="Completed">Mark as Completed</option>
                  <option value="Cancelled">Cancel Order</option>
                </select>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Order;