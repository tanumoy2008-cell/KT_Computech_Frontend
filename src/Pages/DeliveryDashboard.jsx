import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BsQrCodeScan, BsCheckCircle, BsXCircle, BsArrowReturnLeft, BsPerson, BsPhone, BsGeoAlt } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeliveryStatus } from '../Store/reducers/DeliveryReducer';
import axios from '../config/axios';
import { env } from "../config/key"

const DeliveryDashboard = () => {
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true); // Show scanner by default
  const { user } = useSelector(state => state.DeliveryReducer || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if delivery partner is logged in
  useEffect(() => {
    if (!user) {
      navigate('/delivery/login');
    }
  }, [user, navigate]);

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    if (!barcode) {
      toast.warning('Please enter a valid barcode');
      return;
    }
    setScannedBarcode(barcode);
    fetchOrderDetails(barcode);
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/delivery/orders/${orderId}`, {
        headers: {
          [env.VITE_DELIVERY_TOKEN_NAME]: localStorage.getItem('deliveryToken')
        }
      });
      
      if (response.data.success) {
        setOrderDetails(response.data.data);
        toast.success('Order found!');
      } else {
        toast.error(response.data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delivery actions
  const handleDeliveryAction = async (action) => {
    if (!orderDetails) return;

    try {
      setIsLoading(true);
      const response = await axios.put(
        `/api/delivery/orders/${orderDetails._id}/${action}`,
        {},
        { 
          headers: { 
            [env.VITE_DELIVERY_TOKEN_NAME] : localStorage.getItem('deliveryToken') 
          } 
        }
      );

      if (response.data.success) {
        const actionText = action === 'deliver' ? 'delivered' : action;
        toast.success(`Order marked as ${actionText} successfully`);
        
        // Reset for next order
        setOrderDetails(null);
        setScannedBarcode('');
        setShowScanner(true);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle return request
  const handleReturnOrder = async () => {
    if (!orderDetails) return;
    const reason = window.prompt('Please enter return reason:');
    if (!reason) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `/api/delivery/orders/${orderDetails._id}/return`,
        { reason },
        { 
          headers: { 
            [env.VITE_DELIVERY_TOKEN_NAME]: localStorage.getItem('deliveryToken') 
          } 
        }
      );

      if (response.data.success) {
        toast.success('Return request submitted successfully');
        setOrderDetails(null);
        setScannedBarcode('');
        setShowScanner(true);
      }
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error(error.response?.data?.message || 'Failed to process return');
    } finally {
      setIsLoading(false);
    }
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Delivery Partner</h1>
            <button 
              onClick={() => setShowScanner(!showScanner)}
              className="p-2 bg-blue-700 rounded-full"
            >
              <BsQrCodeScan size={20} />
            </button>
          </div>
          {user && (
            <p className="text-sm mt-1">Welcome, {user.name}</p>
          )}
        </div>

        {/* Scanner Section */}
        {showScanner && (
          <div className="p-4 border-b">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scan Order Barcode
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  placeholder="Enter or scan order ID"
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan(scannedBarcode)}
                />
                <button
                  onClick={() => handleBarcodeScan(scannedBarcode)}
                  className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading || !scannedBarcode.trim()}
                >
                  {isLoading ? '...' : 'Go'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !orderDetails && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Fetching order details...</p>
          </div>
        )}

        {/* Order Details */}
        {orderDetails && (
          <div className="divide-y divide-gray-200">
            {/* Order Header */}
            <div className="p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Order #{orderDetails.orderId}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  orderDetails.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                  orderDetails.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderDetails.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(orderDetails.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Customer Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <BsPerson className="mr-2" /> Customer
              </h3>
              <div className="pl-6">
                <p className="font-medium">{orderDetails.customer?.name || 'N/A'}</p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <BsPhone className="mr-1" />
                  <a href={`tel:${orderDetails.customer?.phone}`} className="hover:underline">
                    {orderDetails.customer?.phone || 'N/A'}
                  </a>
                </div>
                <div className="flex items-start text-sm text-gray-600 mt-1">
                  <BsGeoAlt className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>{formatAddress(orderDetails.shippingAddress)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 bg-gray-50">
              <h3 className="font-medium text-gray-700 mb-3">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.variants && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.variants).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{orderDetails.subtotal}</span>
                </div>
                {orderDetails.deliveryCharge > 0 && (
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Delivery:</span>
                    <span>₹{orderDetails.deliveryCharge}</span>
                  </div>
                )}
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600">
                    <span>Discount:</span>
                    <span>-₹{orderDetails.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{orderDetails.total}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {orderDetails.deliveryInstructions && (
              <div className="p-4 bg-yellow-50 border-y border-yellow-100">
                <h3 className="font-medium text-yellow-800 mb-1">Delivery Instructions</h3>
                <p className="text-sm text-yellow-700">{orderDetails.deliveryInstructions}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 bg-white sticky bottom-0 border-t">
              {orderDetails.status === 'out_for_delivery' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDeliveryAction('deliver')}
                    disabled={isLoading}
                    className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                  >
                    <BsCheckCircle className="mr-2" /> Delivered
                  </button>
                  <button
                    onClick={() => handleDeliveryAction('undeliverable')}
                    disabled={isLoading}
                    className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
                  >
                    <BsXCircle className="mr-2" /> Can't Deliver
                  </button>
                </div>
              ) : orderDetails.status === 'delivered' && orderDetails.canReturn ? (
                <button
                  onClick={handleReturnOrder}
                  disabled={isLoading}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 flex items-center justify-center disabled:opacity-50"
                >
                  <BsArrowReturnLeft className="mr-2" /> Process Return
                </button>
              ) : (
                <div className="text-center text-gray-500 py-2">
                  No actions available for this order status
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!orderDetails && !isLoading && !showScanner && (
          <div className="p-8 text-center text-gray-500">
            <p>Scan an order barcode to begin</p>
            <button
              onClick={() => setShowScanner(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Show Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;