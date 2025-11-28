import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../config/axios'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiArrowLeft, FiLoader, FiCheckCircle, FiCreditCard } from 'react-icons/fi'

const OrderPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentResponse = location.state?.paymentResponse;

  if (!paymentResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any payment information for your order.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Checkout
          </button>
        </div>
      </div>
    )
  }
  
  const { order: initialOrder, razorpayOrderId, message } = paymentResponse;
  
  // Local editable order state so we can change quantities client-side
  const [order, setOrder] = useState(() => ({
    ...initialOrder,
    items: (initialOrder?.items || []).map(it => ({ ...it }))
  }))

  useEffect(() => {
    // ensure if route state changes we update local order
    setOrder({ ...initialOrder, items: (initialOrder?.items || []).map(it => ({ ...it })) })
  }, [initialOrder])

  const recalcTotals = (items) => {
    const subtotal = items.reduce((s, it) => {
      const qty = Number(it.qty || 1);
      // Prefer server-provided total (which is discounted total), otherwise compute from UnitPrice and off
      if (it.total && Number(it.total) !== 0) return s + Number(it.total);
      const unitBase = Number(it.UnitPrice || it.price || 0);
      const off = Number(it.off || 0);
      const unitFinal = unitBase * (1 - off / 100);
      return s + unitFinal * qty;
    }, 0)
    const shipping = Number(order?.shipping || 0) || 0
    const total = subtotal + shipping
    return { subtotal, shipping, total }
  }

  const totals = useMemo(() => recalcTotals(order.items || []), [order])

  const updateQty = (index, delta) => {
    setOrder(prev => {
      const items = prev.items.map((it, i) => {
        if (i !== index) return it
        const nextQty = Math.max(1, Number(it.qty || 1) + delta)
        return { ...it, qty: nextQty }
      })
      return { ...prev, items }
    })
  }

  const [isProcessing, setIsProcessing] = useState(false)

  const openRazorpayCheckout = async () => {
    setIsProcessing(true)
    if (!(window && window.Razorpay)) {
      toast.error('Payment gateway not available. Make sure the Razorpay script is included in index.html')
      setIsProcessing(false)
      return
    }
    // Prepare payload for backend: map items to expected shape
    const payload = {
      products: (order.items || []).map(it => ({
        productId: it.productId, // or it._id if that's your product id
        colorVariantId: it.colorVariantId, // must be present!
        name: it.name,
        // send base unit price (UnitPrice) so server can apply discounts consistently
        price: Number(it.UnitPrice || it.price || it.total || 0),
        quantity: Number(it.qty || 1)
      }))
    }


    try {
      const res = await axios.post('/api/payment/online-order', payload)
      const data = res.data
      if (!data.success) {
        toast.error(data.message || 'Could not create online order')
        setIsProcessing(false)
        return
      }

      const serverOrder = data.order
      const serverRazorpayOrderId = data.razorpayOrderId
      // Prefer server totals (persisted) for payment amount
      const payTotal = (serverOrder && typeof serverOrder.total === 'number') ? serverOrder.total : totals.total
      const amountINR = Math.round(Number(payTotal || 0) * 100)

      const key = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_placeholder';
      if (!key || key === 'rzp_test_placeholder') {
        toast.error('Razorpay key not configured. Set VITE_RAZORPAY_KEY env variable or window.__RAZORPAY_KEY__')
        setIsProcessing(false)
        return
      }

      const options = {
        key: key,
        amount: amountINR,
        currency: 'INR',
        name: 'Shop',
        description: `Order ${serverOrder?.orderNumber || serverRazorpayOrderId || ''}`,
        order_id: serverRazorpayOrderId || undefined,
        handler: function (response) {
          toast.success('Payment successful')
          // TODO: POST the response to backend to verify signature and update order status
          navigate('/')
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled')
          }
        },
        prefill: {
          name: serverOrder?.customerName || order?.customerName || '',
          email: serverOrder?.customerEmail || order?.customerEmail || '',
          contact: serverOrder?.customerPhone || order?.customerPhone || ''
        }
      }

      /* global Razorpay */
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(err.message || 'Could not create checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-700/90 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <FiShoppingBag className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Order Summary</h1>
              </div>
              <span className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1 bg-white/20 text-sm font-medium rounded-full">
                Order #{order?.orderNumber?.substring(0, 8) || 'N/A'}
              </span>
            </div>
            <p className="mt-2 text-blue-100">{message}</p>
          </div>

          <div className="p-6 sm:p-8">
            {order && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full mr-2"></span>
                    Your Items ({order.items?.length || 0})
                  </h2>
                  
                  <div className="space-y-4">
                    {order.items?.map((it, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start sm:items-center space-x-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {it.image ? (
                              <img 
                                src={it.image} 
                                alt={it.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <FiShoppingBag className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{it.name}</h3>
                            <p className="text-sm text-gray-500">
                              ₹{(
                                // Show per-unit final price: prefer it.total/qty if available, else compute from UnitPrice and off
                                it.total && it.qty ? (Number(it.total) / Number(it.qty)) : (Number(it.UnitPrice || it.price || 0) * (1 - (Number(it.off || 0) / 100)))
                              ).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateQty(idx, -1)} 
                              disabled={isProcessing || (it.qty || 1) <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{it.qty || 1}</span>
                            <button 
                              onClick={() => updateQty(idx, 1)} 
                              disabled={isProcessing}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="font-semibold text-emerald-700">
                            ₹{(Number(it.price || it.total || 0) * Number(it.qty || 1)).toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{totals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">INR</span>
                        <span>₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <div className="mt-8">
              <button
                onClick={openRazorpayCheckout}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-green-700/90 hover:from-emerald-700 hover:to-green-700 shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed ${isProcessing ? 'opacity-90' : ''}`}
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </button>
              
              <p className="mt-3 text-center text-sm text-gray-500">
                You'll be redirected to Razorpay's secure payment page
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-700">
                <span>Razorpay Order ID: <span className="font-mono text-sm border border-gray-400 bg-gray-300 px-2 py-1 rounded">{razorpayOrderId || 'N/A'}</span></span>
                <div className="flex items-center mt-2 sm:mt-0">
                  <FiCheckCircle className="w-5 h-5 text-green-700 mr-1" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderPayment