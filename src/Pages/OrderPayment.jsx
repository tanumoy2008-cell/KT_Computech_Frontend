import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../config/axios'


const OrderPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentResponse = location.state?.paymentResponse;

  if (!paymentResponse) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">No payment information found</h2>
        <p className="mt-4">Please go back and try purchasing again.</p>
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
    const subtotal = items.reduce((s, it) => s + (Number(it.price || it.total || 0) * Number(it.qty || 1)), 0)
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
    // Ensure the Razorpay script is available. The script should be added to index.html
    // as: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    if (!(window && window.Razorpay)) {
      toast.error('Payment gateway not available. Make sure the Razorpay script is included in index.html')
      setIsProcessing(false)
      return
    }

    // Prepare payload for backend: map items to expected shape
    const payload = {
      products: (order.items || []).map(it => ({
        id: it.id || it._id || undefined,
        name: it.name,
        price: Number(it.price || it.total || 0),
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
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Order Payment</h1>
      <p className="mb-2">{message}</p>

      {order && (
        <div className="mb-6">
          <h2 className="font-semibold">Order: {order.orderNumber}</h2>
          <p className="text-sm text-gray-600">Razorpay Order Id: {razorpayOrderId}</p>

          <div className="mt-4 bg-white p-4 rounded shadow-sm">
            <h3 className="font-medium mb-2">Items</h3>
            <ul className="space-y-3">
              {order.items?.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-600">₹{it.price ?? it.total} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(idx, -1)} className="px-2 py-1 border rounded">-</button>
                    <div className="px-3">{it.qty}</div>
                    <button onClick={() => updateQty(idx, 1)} className="px-2 py-1 border rounded">+</button>
                    <div className="ml-4 font-medium">₹{(Number(it.price || it.total || 0) * Number(it.qty || 1)).toFixed(2)}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{totals.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>₹{totals.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={openRazorpayCheckout} className="px-4 py-2 bg-blue-600 text-white rounded">Pay with Razorpay</button>
        <button onClick={() => navigate('/')} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  )
}

export default OrderPayment