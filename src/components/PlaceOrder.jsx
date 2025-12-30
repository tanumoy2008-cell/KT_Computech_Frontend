import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setCart } from '../Store/reducers/CartReducer';
import { motion, AnimatePresence } from 'framer-motion';

// Formatting helpers lifted to module scope so modal and list can both use them
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace('₹', '₹');
};

const getPaymentMethodIcon = (method) => {
  switch (String(method || '').toLowerCase()) {
    case 'UPI': return '💸';
    case 'Online': return '💳';
    case 'Cash': return '💵';
    default: return '💰';
  }
};

const PlaceOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Review modal state (only allow after delivery/completion)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState([]); // track productIds already reviewed in this session
  const dispatch = useDispatch();

  // returns true if order is within 1 hour and in a cancellable status
  const isCancellable = (order) => {
    if (!order) return false;
    const forbidden = ['Cancelled', 'Delivered', 'Shipped'];
    if (forbidden.includes(order.status)) return false;
    const created = order.createdAt ? new Date(order.createdAt).getTime() : 0;
    const now = Date.now();
    const ONE_HOUR_MS = 60 * 60 * 1000;
    return (now - created) <= ONE_HOUR_MS;
  };

  // cancel handler: calls backend and updates local state
  const handleCancel = async (orderId) => {
    const ok = window.confirm('Are you sure you want to cancel this order? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await axios.patch(`/api/orders/my/${orderId}/cancel`);
      const updated = res.data.order;
      // update orders list and selectedOrder
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      setSelectedOrder(updated);
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Cancel order failed', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Re-order handler: add items back to cart
  const handleReorder = async (order) => {
    if (!order || !order.items || !order.items.length) return;
    try {
      // Resolve color names when missing: collect productIds that need variant lookup
      const items = order.items || [];
      const needsLookup = items.filter(it => !it.color && !(it.colorVariantId && it.colorVariantId.name));
      const productFetchMap = {};
      if (needsLookup.length) {
        const uniqueProductIds = [...new Set(needsLookup.map(it => it.productId && (it.productId._id || it.productId)).filter(Boolean))];
        await Promise.all(uniqueProductIds.map(async pid => {
          try {
            const res = await axios.get(`/api/products/productDetail/${pid}`);
            productFetchMap[pid] = res.data; // full product
          } catch (err) {
            // ignore lookup failure for this product
            productFetchMap[pid] = null;
          }
        }));
      }

      // Prepare post promises
      const posts = items.map(item => {
        const productId = item.productId && (item.productId._id || item.productId);
        let color = item.color || '';
        if (!color) {
          if (item.colorVariantId && typeof item.colorVariantId === 'object' && item.colorVariantId.name) {
            color = item.colorVariantId.name;
          } else if (item.colorVariantId) {
            // colorVariantId might be an id string; try to resolve from fetched product
            const prod = productFetchMap[productId];
            if (prod && Array.isArray(prod.colorVariants)) {
              const found = prod.colorVariants.find(v => String(v._id) === String(item.colorVariantId));
              if (found) color = found.Colorname || found.ColorName || found.color || '';
            }
          }
        }
  // Send colorVariantId when available so backend can resolve color and add correct variant
  return axios.post('/api/cart/add-product-in-cart', { productId, color, colorVariantId: item.colorVariantId || (item.colorVariantId && item.colorVariantId._id) });
      });

      await Promise.all(posts);
      // fetch updated cart and update redux store so Cart view shows images/colors
      try {
        const cartRes = await axios.get('/api/cart/send-cart-info');
        const cartData = cartRes.data.cart || [];
        dispatch(setCart(cartData));
      } catch (err) {
        console.warn('Failed to refresh cart after reorder', err);
      }

      toast.success('Items added to cart for re-order');
    } catch (err) {
      console.error('Re-order failed', err);
      toast.error(err.response?.data?.message || 'Failed to add items to cart');
    }
  };

  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders/my');
        if (!mounted) return;
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to load user orders', err);
        toast.error(err.response?.data?.message || 'Failed to load your orders');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading your orders...</div>;
  if (!orders.length) return <div className="p-6">You have not placed any orders yet.</div>;

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold uppercase font-PublicSans mb-4">
          My Orders
        </h2>
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Order #{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>
                  {order.customer?.name && (
                    <div className="text-sm text-gray-700">
                      {order.customer.name}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(order.total)}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      order.status === "Delivered"
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}>
                    {order.status}
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                {order.items?.slice(0, 3).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <div className="truncate max-w-[300px]">
                      {it.name} × {it.qty}
                    </div>
                    <div>{formatCurrency(it.total)}</div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancel={handleCancel}
        isCancellable={isCancellable(selectedOrder)}
        onReorder={handleReorder}
        onOpenReview={(item) => {
          setReviewItem(item);
          setReviewRating(5);
          setReviewText("");
          setReviewModalOpen(true);
        }}
        submittedReviews={submittedReviews}
      />

      {/* Review Modal */}
      {reviewModalOpen && reviewItem && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Write a review for</h3>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {reviewItem.image && (
                    <img
                      src={reviewItem.image}
                      alt={reviewItem.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium">{reviewItem.name}</div>
                    <div className="text-xs text-gray-500">
                      Qty: {reviewItem.qty}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rating
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-2 border rounded-md">
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} ★
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Comment
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border rounded-md p-2"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 border rounded-md">
                    Cancel
                  </button>
                  <button
                    disabled={submittingReview}
                    onClick={async () => {
                      if (!reviewText.trim())
                        return toast.error("Please add a comment");
                      try {
                        setSubmittingReview(true);
                        const pid =
                          reviewItem.productId &&
                          (reviewItem.productId._id || reviewItem.productId);
                        const payload = {
                          productId: pid,
                          rating: reviewRating,
                          comment: reviewText,
                        };
                        await axios.post("/api/review/add", payload);
                        // mark as submitted locally
                        if (pid)
                          setSubmittedReviews((prev) => [...prev, String(pid)]);
                        setReviewModalOpen(false);
                        toast.success("Review submitted — thank you!");
                      } catch (err) {
                        console.error("Review submit failed", err);
                        toast.error(
                          err.response?.data?.message ||
                            "Failed to submit review"
                        );
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md">
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

// (modal is rendered from inside PlaceOrder above)

// Modal for selected order
const OrderModal = ({ order, onClose, onCancel, isCancellable, onReorder, onOpenReview, submittedReviews = [] }) => {
  if (!order) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Order Details</h3>
              <div className="space-y-2 text-sm">
                <p className="text-xs text-gray-500">
                  You can cancel this order within 1 hour from the time it was
                  placed. After 1 hour cancellation will not be allowed. You may
                  also Re-order items from this order if it is Delivered or
                  cancelled.
                </p>
                <div className="h-2" />
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(order.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="ml-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {order.status}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Payment Method:</span>{" "}
                  {getPaymentMethodIcon(order.paymentMode)} {order.paymentMode}
                </p>
              </div>

              <h3 className="font-semibold text-lg mt-6 mb-2">
                Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                {order.customer?.name && (
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.customer.name}
                  </p>
                )}
                {order.customer?.email && (
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.customer.email}
                  </p>
                )}
                {order.customer?.phone && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.customer.phone}
                  </p>
                )}
                {order.customer?.address && (
                  <p className="mt-2">
                    <span className="font-medium block">Address:</span>
                    {order.customer.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-b last:border-b-0 flex justify-between items-center">
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
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.total)}
                      </p>
                      {item.off > 0 && (
                        <p className="text-xs text-green-600">
                          {item.off}% off
                        </p>
                      )}
                      {/* Show write-review button only when order status is Delivered */}
                      {order.status === "Delivered" &&
                        (() => {
                          const pid =
                            item.productId &&
                            (item.productId._id || item.productId);
                          const already =
                            pid && submittedReviews.includes(String(pid));
                          return (
                            <div className="mt-2">
                              <button
                                disabled={already}
                                onClick={() =>
                                  onOpenReview && onOpenReview(item)
                                }
                                className={`px-3 py-1 text-sm rounded-md ${
                                  already
                                    ? "bg-gray-200 text-gray-500"
                                    : "bg-yellow-500 text-white hover:opacity-90"
                                }`}>
                                {already ? "Reviewed" : "Write a review"}
                              </button>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subTotal)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
            {onReorder &&
              (order.status === "Delivered" ||
                order.status === "Cancelled") && (
                <button
                  onClick={() => onReorder(order)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Re-order
                </button>
              )}
            {isCancellable && (
              <button
                onClick={() => onCancel(order._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Cancel Order
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlaceOrder;

// Render modal at bottom of file via selectedOrder state inside component scope