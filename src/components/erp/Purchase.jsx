import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';
import { Barcode } from 'lucide-react';

const API_BASE_URL = '/api/purchase-products';

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    barcode: '',
    productName: '',
    productCategory: '',
    unit: '',
    productSubcategory: '',
    qty: 1,
    extraDiscount: 0,
    purchasePrice: 0,
    purchaseDiscount: 0,
    vender: '',
    purchaseMethod: 'cash',
    purchaseInvoice: '',
    checkNumber: ''
  });
  
  const barcodeInputRef = useRef(null);

  // Fetch purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_BASE_URL}/get`);
      setPurchases(response.data.data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
    [name]: name === 'purchasePrice' || name === 'purchaseDiscount' || name === 'qty' || name === 'extraDiscount'
      ? (name === 'qty' ? parseInt(value) || 1 : parseFloat(value) || 0)
        : value
    }));
  };

  // Focus barcode input when modal opens
  useEffect(() => {
    if (showModal) {
      setTimeout(() => barcodeInputRef.current?.focus(), 50);
    }
  }, [showModal]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barcode) return;
    
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/barcode/${formData.barcode}`);
      if (response.data.success) {
        const { productId, name, price, category, subcategory, unit, barcode } = response.data.data;
        setFormData(prev => ({
          ...prev,
          productId,
          productName: name,
          purchasePrice: price,
          productCategory: category || '',
          unit: unit || '',
          barcode: formData.barcode // Keep the barcode in form data
        }));
        toast.success('Product found!');
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      toast.error(error.response?.data?.message || 'Product not found');
    }
  };
  
  const resetForm = () => {
    setFormData({
      productId: '',
      barcode: '',
      productName: '',
      productCategory: '',
      unit: '',
      date: '',
      qty: 1,
      extraDiscount: 0,
      purchasePrice: 0,
      purchaseDiscount: 0,
      vender: '',
      purchaseMethod: 'cash',
      purchaseInvoice: '',
      checkNumber: ''
    });
    setEditingPurchase(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId && !formData.barcode) {
      toast.error('Please scan a barcode or select a product');
      return;
    }
    
    try {
      const payload = { ...formData };
      // map `date` (frontend) -> `Date` (backend schema) so backend stores in `Date` field
      if (payload.date && !payload.Date) {
        payload.Date = payload.date;
        delete payload.date;
      }
      // Backend expects either productId OR barcode. If we already resolved productId, don't send raw barcode.
      if (payload.productId) delete payload.barcode;
      // productName is only UI; don't send to backend
      if (payload.productName) delete payload.productName;
  // unit and productCategory are valid fields we want to send if present

      if (editingPurchase) {
        await axiosInstance.put(`${API_BASE_URL}/update/${editingPurchase._id}`, payload);
        toast.success('Purchase order updated successfully');
      } else {
        await axiosInstance.post(`${API_BASE_URL}/create`, payload);
        toast.success('Purchase order created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.error(error.response?.data?.message || 'Error saving purchase order');
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      productId: purchase.productId?._id || '',
      barcode: '', // Clear barcode in edit mode to force rescan
      productName: purchase.productId?.name || '',
      productCategory: purchase.productCategory || purchase.productId?.category || '',
      qty: purchase.qty || 1,
      extraDiscount: purchase.extraDiscount || 0,
      unit: purchase.unit || purchase.productId?.unit || '',
      date: purchase.Date ? new Date(purchase.Date).toISOString().slice(0,10) : (purchase.date ? new Date(purchase.date).toISOString().slice(0,10) : ''),
      purchasePrice: purchase.purchasePrice,
      purchaseDiscount: purchase.purchaseDiscount,
      vender: purchase.vender,
      purchaseMethod: purchase.purchaseMethod,
      purchaseInvoice: purchase.purchaseInvoice || '',
      checkNumber: purchase.checkNumber || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axiosInstance.delete(`${API_BASE_URL}/delete/${id}`);
        toast.success('Purchase order deleted successfully');
        fetchPurchases();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        toast.error('Failed to delete purchase order');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate price after primary discount and extra discount (sequential)
  // Returns numeric value (not formatted)
  const calculateTotal = (price = 0, discount = 0, extraDiscount = 0) => {
    const afterPrimary = price - (price * (discount / 100));
    const afterExtra = afterPrimary - (afterPrimary * (extraDiscount / 100));
    return afterExtra;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <span>+</span> New Purchase Order
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Discount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">PO-{purchase._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.productId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.qty || 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.productSubcategory || purchase.productId?.Subcategory || purchase.productId?.Maincategory || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.unit || purchase.productId?.unit || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.vender || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">₹{purchase.purchasePrice?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">{purchase.purchaseDiscount}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">{purchase.extraDiscount ? `${purchase.extraDiscount}%` : '0%'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ₹{(calculateTotal(purchase.purchasePrice, purchase.purchaseDiscount, purchase.extraDiscount) * (purchase.qty || 1)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{purchase.purchaseMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.Date ? formatDate(purchase.Date) : formatDate(purchase.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(purchase)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(purchase._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                      No purchase orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingPurchase ? 'Edit' : 'Add New'} Purchase Order
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Barcode lookup: scanning or manual entry */}
              <div className="mb-4">
                <label className="text-sm font-medium flex gap-x-1 text-gray-700 mb-1">
                  <Barcode color="gray" size={20} strokeWidth={3} />
                  Barcode (scan or enter)
                </label>
                <div className="flex gap-2">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeSubmit(e); }}
                    placeholder="Scan or type barcode and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleBarcodeSubmit}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Lookup
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, barcode: '', productId: '', productName: '', purchasePrice: 0 }))}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">You can either scan a barcode or enter a Product ID below.</p>
              </div>

              <div className="mb-4 md:mb-0 md:ml-4 w-40">
                <label className="text-sm font-medium text-gray-700 mb-1">Qty</label>
                <input
                  type="number"
                  name="qty"
                  min={1}
                  value={formData.qty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID (optional)
                </label>
                <input
                  type="text"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Read-only product name to show what was found by barcode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  readOnly
                  placeholder="Product name will appear after barcode lookup"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="productCategory"
                    value={formData.productCategory}
                    onChange={handleInputChange}
                    placeholder="Product category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    <option value="pic's">pic's</option>
                    <option value="set's">set's</option>
                    <option value="packet's">packet's</option>
                    <option value="box's">box's</option>
                    <option value="carton's">carton's</option>
                    <option value="sheet's">sheet's</option>
                    <option value="dozen's">dozen's</option>
                    <option value="bottle's">bottle's</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    name="vender"
                    value={formData.vender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    name="purchaseInvoice"
                    value={formData.purchaseInvoice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    name="purchaseDiscount"
                    value={formData.purchaseDiscount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Discount (%)</label>
                  <input
                    type="number"
                    name="extraDiscount"
                    value={formData.extraDiscount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="purchaseMethod"
                  value={formData.purchaseMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="credit">Credit</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {formData.purchaseMethod === 'cheque' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check #
                  </label>
                  <input
                    type="text"
                    name="checkNumber"
                    value={formData.checkNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {editingPurchase ? 'Update' : 'Create'} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchase;