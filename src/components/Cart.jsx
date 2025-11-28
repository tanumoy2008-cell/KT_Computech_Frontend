import React, { useEffect, useState, useCallback } from "react";
import CartCard from "./CartCard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import emptyCart from "../assets/Empty Box Animation.json";
import axios from "../config/axios";
import { setCart } from "../Store/reducers/CartReducer";
import { toast } from "react-toastify";
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiDollarSign, FiLoader, FiX } from "react-icons/fi";
import { BsQrCode, BsCash } from "react-icons/bs";

const Cart = () => {
  const user = useSelector((state) => state.UserReducer);
  const { items } = useSelector((state) => state.CartReducer);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Make sure your total is calculated correctly
const { subtotal, discount, total, totalItems } = React.useMemo(() => {
  if (!items || !items.length) {
    return { subtotal: 0, discount: 0, total: 0, totalItems: 0 };
  }

  const result = items.reduce((acc, item) => {
    if (!item || !item.price || !item.quantity) return acc;
    
    const itemPrice = Number(item.price) * Number(item.quantity);
    const itemDiscount = item.off 
      ? (Number(item.price) * Number(item.off) * Number(item.quantity)) / 100 
      : 0;
    
    return {
      subtotal: acc.subtotal + itemPrice,
      discount: acc.discount + itemDiscount,
      totalItems: acc.totalItems + Number(item.quantity)
    };
  }, { subtotal: 0, discount: 0, totalItems: 0 });

  return {
    ...result,
    total: Math.max(0, result.subtotal - result.discount),
  };
}, [items]);

  // ⭐ FETCH CART
  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get("/api/cart/send-cart-info");
      if (Array.isArray(res.data.cart)) {
        dispatch(setCart({ items: res.data.cart }));
      } else {
        dispatch(setCart({ items: [] }));
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      dispatch(setCart({ items: [] }));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Process payment
  const processPayment = async () => {
    if (!items?.length) return;
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'online') {
        // Process online payment with Razorpay
        const orderResponse = await axios.post('/api/payment/create-razorpay-order', {
        amount: total, // Send amount in rupees, not paise
        currency: 'INR',
        items: items.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          image: item.image
        }))
      });

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }

        console.log('Razorpay options before init:', {
        amount: orderResponse.data.order.amount,
        currency: orderResponse.data.order.currency,
        order_id: orderResponse.data.order.id
      });

        // In your processPayment function, update the Razorpay options:
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: orderResponse.data.order.amount, // Make sure to use order.amount
          currency: orderResponse.data.order.currency,
          name: "KT Computech",
          description: `Order for ${items.length} item${items.length > 1 ? 's' : ''}`,
          order_id: orderResponse.data.order.id,
          handler: async function (response) {
            try {
              setIsProcessing(true);
              const result = await axios.post("/api/payment/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: items.map(item => ({
                  productId: item._id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  color: item.color,
                  image: item.image
                })),
                total: total,
                paymentMethod: 'online'
              });

              if (result.data.success) {
                toast.success('Payment successful!');
                dispatch(setCart({ items: [] }));
                navigate('/user/order-history');
              }
            } catch (error) {
              console.error('Payment verification failed:', error);
              toast.error('Payment verification failed. Please check your order status or contact support.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name:  `${user.fullName.firstName} ${user.fullName.lastName}` || "Customer Name", // TODO: Get from user profile
            email: user.email || "customer@example.com",
            contact: user.phoneNumber || "+911234567890"
          },
          theme: {
            color: "#10b981"
          },
          modal: {
            ondismiss: function() {
              toast.info("Payment window closed. Your order was not placed.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function(response) {
          const errorMessage = response.error.description || 'Payment was not successful. Please try again.';
          toast.error(`Payment failed: ${errorMessage}`);
        });
        
        rzp.on('payment.authorized', function(response) {
          // This will be handled by the handler function
        });
        
        rzp.open();
        
      } else {
        // Process Cash on Delivery
        const result = await axios.post("/api/payment/create-offline-order", {
          items: items.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            image: item.image
          })),
          total: total,
          paymentMethod: 'cod'
        });

        if (result.data.success) {
          toast.success('Order placed successfully! You will pay when your order is delivered.');
          dispatch(setCart({ items: [] }));
          navigate('/user/order-history');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process payment. Please try again.';
      toast.error(errorMessage);
      
      // If Razorpay fails to load, switch to COD
      if (error.message.includes('Razorpay') && paymentMethod === 'online') {
        toast.info('Falling back to Cash on Delivery');
        setPaymentMethod('cod');
        // Retry with COD
        await processPayment();
      }
    } finally {
      setIsProcessing(false);
      setShowPaymentOptions(false);
    }
  };

  // Load Razorpay script with retry mechanism
  const loadRazorpayScript = (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      
      const maxRetries = 2;
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        if (window.Razorpay) {
          resolve();
        } else if (retryCount < maxRetries) {
          // Retry loading the script
          document.body.removeChild(script);
          loadRazorpayScript(retryCount + 1).then(resolve).catch(reject);
        } else {
          reject(new Error('Failed to load Razorpay after multiple attempts'));
        }
      };
      
      script.onerror = () => {
        if (retryCount < maxRetries) {
          // Retry loading the script
          document.body.removeChild(script);
          loadRazorpayScript(retryCount + 1).then(resolve).catch(reject);
        } else {
          const error = new Error('Failed to load payment processor');
          toast.error('Failed to load payment processor. Please try Cash on Delivery.');
          reject(error);
        }
      };
      
      document.body.appendChild(script);
    });
  };

  // Handle buy now click
  const handleBuyNow = () => {
    if (!items?.length) return;
    
    setShowPaymentOptions(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Cart {items?.length > 0 && `(${items.length} items)`}
          </h1>
          
          {items?.length > 0 && (
            <div className="ml-auto flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/product/all")}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={isProcessing}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" /> Processing...
                  </span>
                ) : (
                  'Proceed to Checkout'
                )}
              </motion.button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {!items || items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-sm p-8 text-center"
              >
                <Lottie
                  animationData={emptyCart}
                  loop={true}
                  className="w-48 h-48 mx-auto"
                />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Your cart is empty
                </h2>
                <p className="mt-2 text-gray-500">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={() => navigate("/product/all")}
                  className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Start Shopping
                </button>
              </motion.div>
            ) : (
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item._id}-${item.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    layout
                  >
                    <CartCard 
                      item={item} 
                      onRemove={fetchCart}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-medium text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={!items?.length || isProcessing}
                className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !items?.length || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" /> Processing...
                  </span>
                ) : (
                  'Proceed to Checkout'
                )}
              </motion.button>
            </div>

            {/* Payment Options Modal */}
            <AnimatePresence>
              {showPaymentOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
                  >
                    <button
                      onClick={() => setShowPaymentOptions(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Select Payment Method
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                      {/* Online Payment Option */}
                      <div 
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'online' 
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              paymentMethod === 'online' 
                                ? 'border-green-600 bg-green-600' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {paymentMethod === 'online' && (
                                <FiCheckCircle className="h-3.5 w-3.5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 flex items-center">
                              <FiCreditCard className="mr-2 text-green-600" />
                              Pay Online
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Secured payment via Razorpay. All major cards, UPI, and net banking accepted.
                            </p>
                            <div className="mt-2 flex items-center text-xs text-green-700">
                              <FiCheckCircle className="mr-1" /> Instant order confirmation
                            </div>
                          </div>
                          <FiCreditCard className="ml-auto text-gray-400" />
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                            paymentMethod === 'cash' 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'cash' && (
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <p className="text-sm text-gray-500">Pay with cash or UPI when your order is delivered to your doorstep.</p>
                            <div className="mt-2 flex items-center text-xs text-green-700">
                              <FiCheckCircle className="mr-1" /> No advance payment required
                            </div>
                          </div>
                          <BsCash className="ml-auto text-gray-400" />
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'upi' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                            paymentMethod === 'upi' 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'upi' && (
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">UPI Payment</div>
                            <p className="text-sm text-gray-500">Pay using any UPI app</p>
                          </div>
                          <BsQrCode className="ml-auto text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Order Total</span>
                        <span className="font-medium">₹{total.toFixed(2)}</span>
                      </div>
                      {paymentMethod === 'cash' && total > 2000 && (
                        <p className="text-sm text-yellow-600 mt-2">
                          Note: For orders above ₹2000, online payment is required for security reasons.
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowPaymentOptions(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowPaymentOptions(false);
                          processPayment();
                        }}
                        disabled={isProcessing || (paymentMethod === 'cash' && total > 2000)}
                        className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isProcessing || (paymentMethod === 'cash' && total > 2000)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <FiLoader className="animate-spin mr-2" /> Processing...
                          </span>
                        ) : (
                          'Confirm Payment'
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;