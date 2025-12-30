import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaChevronLeft, FaCartPlus, FaMapMarkerAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addProductToCart } from "../Store/reducers/CartReducer";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { env } from "../config/key";


const ProductDets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkTimeout = useRef(null);
  const user = useSelector((state) => state.UserReducer);
  const admin = useSelector((state) => state.AdminReducer);
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState("");
  const [pinColor, setPinColor] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  // Reviews & related products
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  // Configurable zoom multiplier (1 = no zoom). Lower = gentler zoom.
  const ZOOM_SCALE = 1.25; // try 1.1 - 1.5

  useEffect(()=> {
    window.scrollTo(0,0)
  })

  // Handle mouse enter/leave for zoom effect
  const handleMouseEnter = () => {
    if (imageRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // store container rect (viewport coordinates) for percentage calculations
      setContainerRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
      setShowZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
    // For a fixed-position zoom bubble, use viewport coordinates (clientX/clientY)
    setCursorPosition({ 
      x: e.clientX,
      y: e.clientY
    });
  };

  // Fetch product details
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/product/productDetail/${id}`);
        if (!isMounted) return;
        const prod = res.data;
        setProduct(prod);

        if (prod.colorVariants?.length > 0) {
          const firstColor = prod.colorVariants[0];
          setSelectedColor(firstColor);
          setSelectedImage(firstColor.images?.[0] || "/placeholder.png");
        } else {
          setSelectedImage(prod.images?.[0] || "/placeholder.png");
        }
      } catch {
        toast.error("Failed to load product details");
      }
    })();

    return () => (isMounted = false);
  }, [id]);

  // Fetch reviews and related products when product loads
  useEffect(() => {
    if (!product?._id) return;

    let mounted = true;
    (async () => {
      try {
        // Try fetching reviews (fallback to product.reviews if available)
        const rRes = await axios.get(`/api/review/product/${product._id}`).catch(() => ({ data: { reviews: product.reviews || [] } }));
        const fetchedReviews = rRes.data.reviews || rRes.data || [];
        if (!mounted) return;
        setReviews(fetchedReviews);
        const avg = fetchedReviews.length ? (fetchedReviews.reduce((s, r) => s + (r.rating || 0), 0) / fetchedReviews.length) : 0;
        setAvgRating(Number(avg.toFixed(1)));

        // Fetch related products (server-side recommended) with fallback to empty
        const rel = await axios.get(`/api/product/related/${product._id}`).catch(() => ({ data: { related: [] } }));
        if (!mounted) return;
        setRelatedProducts(rel.data.related || rel.data || []);
      } catch (err) {
        console.error('Error fetching reviews/related:', err);
      }
    })();

    return () => (mounted = false);
  }, [product]);

  const totalStock = product?.colorVariants?.reduce((acc, cv) => acc + (cv.stock || 0), 0) || 0;
  const selectedStock = selectedColor ? (selectedColor.stock || 0) : totalStock;

  // Admin: toggle visibility
  const toggleVisibility = async () => {
    try {
      // require admin token present in axios defaults (Admin login middleware sets it)
      const res = await axios.patch(`/api/product/visibility/${product._id}`, { visibility: !product.visibility });
      if (res?.data?.product) {
        setProduct(res.data.product);
        toast.success(res.data.message || 'Visibility updated');
      }
    } catch (err) {
      console.error('Toggle visibility failed', err);
      toast.error(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  // Back navigation
  const handleNavigateBack = () => {
    navigate(-2);
  };

  // Select color variant
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImage(color.images?.[0] || "/placeholder.png");
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      await axios.post("/api/cart/add-product-in-cart", {
        productId: product._id,
        color: selectedColor?.Colorname || "",
      });
      dispatch(addProductToCart({ ...product, color: selectedColor?.Colorname }));
      toast.success("Product added to cart!");
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || "Error adding to cart");
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    try {
      const payload = {
        products: [
          {
            productId: product._id,
            colorVariantId: selectedColor?._id,
            name: product.name + (selectedColor ? ` (${selectedColor.Colorname})` : ""),
            price: product.price,
            quantity: 1,
            off: product.off || 0,
            image: selectedImage || null
          }
        ],
        paymentMode: 'Online'
      };

      const res = await axios.post('/api/payment/online-order', payload);

      // Navigate to OrderPayment page — let that page handle checkout and verification
      navigate('/order-payment', { state: { paymentResponse: res.data } });
    } catch (err) {
      console.error('Buy now failed:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate order.');
    }
  };

  // Pin code check (debounced)
  useEffect(() => {
    if (!pin) {
      setPinResult("");
      setPinColor("");
      return;
    }

    // Simple validation for 6-digit pincode
    if (!/^\d{6}$/.test(pin)) {
      setPinResult("Please enter a valid 6-digit pincode");
      setPinColor("text-yellow-600 font-medium");
      return;
    }

    clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.post("/api/pinCode/check-available-pincode", { pin });
        if (res.data.serviceable) {
          const { message, deliveryDays, codAvailable } = res.data;
          let resultMessage = message;
          
          if (deliveryDays) {
            resultMessage += ` (${deliveryDays} ${deliveryDays === 1 ? 'day' : 'days'} delivery)`;
          }
          
          if (codAvailable === false) {
            resultMessage += " - COD not available";
          }
          
          setPinResult(resultMessage);
          setPinColor("text-green-600 font-medium");
        } else {
          setPinResult(res.data.message || "Delivery not available for this pincode");
          setPinColor("text-red-600 font-medium");
        }
      } catch (err) {
        console.error('Error checking pincode:', err);
        const errorMessage = err.response?.data?.message || 'Error checking pincode';
        setPinResult(errorMessage);
        setPinColor("text-red-600 font-medium");
      }
    }, 1000);

    return () => clearTimeout(checkTimeout.current);
  }, [pin]);

  const colors = ["red", "blue", "green", "purple", "yellow", "pink", "indigo"];
  // Reusable action buttons (stack on small, side-by-side on md+)
  const ActionButtons = () => (
    <div className="w-full flex flex-col md:flex-row gap-4">
      <motion.button
        onClick={handleAddToCart}
        whileTap={{ scale: 0.98 }}
        className="flex-1 w-full flex items-center cursor-pointer justify-center gap-2 px-6 py-3 border-2 border-green-600 rounded-xl text-green-700 font-semibold hover:bg-green-50 transition-colors">
        <FaCartPlus className="h-5 w-5" />
        <span>Add to Cart</span>
      </motion.button>

      <motion.button
        onClick={handleBuyNow}
        whileTap={{ scale: 0.98 }}
        className="flex-1 w-full bg-gradient-to-r cursor-pointer from-emerald-500 px-6 py-3 to-emerald-700 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
        Buy Now
      </motion.button>
    </div>
  );

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br shadow-2xl from-gray-200 to-gray-400">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={handleNavigateBack}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <FaChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-4 text-lg font-medium text-gray-900 line-clamp-1">
                {product.name}
              </h1>
            </div>
            {/* Admin visibility toggle */}
            {admin?.isAuthenticated &&
              admin?.user &&
              (admin.user.role === "admin" ||
                admin.user.role === "superAdmin") && (
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${
                      product.visibility ? "text-green-700" : "text-gray-500"
                    }`}>
                    {product.visibility ? "Visible" : "Hidden"}
                  </span>
                  <button
                    onClick={toggleVisibility}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                      product.visibility
                        ? "bg-green-600 text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}>
                    Toggle
                  </button>
                </div>
              )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-6">
        <motion.div
          className="bg-white rounded-2xl shadow-lg shadow-zinc-500 border border-black/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}>
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2 p-4 md:p-8 border-b-0 border-black/20 lg:border-b">
              <div
                className="relative aspect-square w-full bg-gray-200 rounded-xl overflow-hidden group"
                ref={containerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}>
                <motion.img
                  ref={imageRef}
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-opacity duration-300"
                  draggable={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  key={selectedImage}
                />
                {showZoom && (
                  <motion.div
                    ref={zoomRef}
                    className="fixed w-64 h-64 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl pointer-events-none z-50 bg-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      left: cursorPosition.x,
                      top: cursorPosition.y,
                      transform: "translate(-50%, -50%)",
                      backgroundImage: `url(${selectedImage})`,
                      // backgroundPosition uses percentage from zoomPosition
                      backgroundPosition: `${Math.min(
                        100,
                        Math.max(0, zoomPosition.x)
                      )}% ${Math.min(100, Math.max(0, zoomPosition.y))}%`,
                      // use configurable zoom scale; fallback to percentage
                      backgroundSize:
                        imageRef.current &&
                        imageRef.current.naturalWidth &&
                        imageRef.current.naturalHeight
                          ? `${imageRef.current.naturalWidth * ZOOM_SCALE}px ${
                              imageRef.current.naturalHeight * ZOOM_SCALE
                            }px`
                          : `${Math.round(ZOOM_SCALE * 100)}% auto`,
                      backgroundRepeat: "no-repeat",
                      borderRadius: "50%",
                      boxShadow:
                        "0 0 0 7px #ffffff, 0 5px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </div>

              {/* Thumbnails */}
              {selectedColor?.images?.length > 1 && (
                <div className="mt-6">
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {selectedColor.images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img
                            ? "border-green-500 ring-2 ring-green-300"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full lg:w-1/2 p-4 md:p-8 lg:border-l lg:border-b border-black/20">
              <div className="space-y-6">
                {/* Brand & Rating */}
                <div className="space-y-2">
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {product.company || "Premium Brand"}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(avgRating || 0)
                              ? "text-emerald-400"
                              : "text-gray-400"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹
                      {product.off > 0
                        ? calculateDiscountedPrice(product.price, product.off)
                        : product.price}
                    </span>
                    {product.off > 0 && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                        <span className="bg-red-100 text-red-600 border-2 text-xs font-medium px-2 py-1 border-dashed rounded-full">
                          {product.off}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {product.off > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      You save ₹
                      {product.price -
                        calculateDiscountedPrice(product.price, product.off)}
                    </div>
                  )}
                </div>

                {/* Color Picker */}
                {product.colorVariants?.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Color:{" "}
                        <span className="font-semibold">
                          {selectedColor?.Colorname || "Select"}
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500">
                        {product.colorVariants.length} options
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colorVariants.map((color, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleColorSelect(color)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedColor?.Colorname === color.Colorname
                              ? "ring-2 ring-offset-1 ring-green-400 border-white shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: color.colorCode || "#ccc" }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={color.Colorname}>
                          {selectedColor?.Colorname === color.Colorname && (
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Description
                  </h3>
                  <div className="prose prose-sm text-gray-600">
                    {Array.isArray(product.description) ? (
                      <ul className="space-y-1">
                        {product.description.map((desc, i) => (
                          <li key={i} className="flex items-start">
                            <svg
                              className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{product.description}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      {/* Low stock label */}
                      {selectedStock !== undefined &&
                        selectedStock > 0 &&
                        selectedStock <= 5 && (
                          <div className="mt-2 inline-block px-2 py-1 rounded text-sm font-semibold text-red-800 bg-red-100">
                            Only {selectedStock} left
                          </div>
                        )}
                      <h4 className="font-medium text-gray-900">
                        Delivery & Returns
                      </h4>
                      <p className="text-sm text-gray-500">
                        Check estimated delivery date
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        placeholder="Enter PIN code"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 placeholder:text-gray-500 border border-gray-500 rounded-lg outline-none text-sm"
                      />
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <button className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
                      Check
                    </button>
                  </div>

                  {pinResult && (
                    <div className={`text-sm font-medium ${pinColor}`}>
                      {pinResult}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="p-1.5 bg-green-50 rounded-md">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Free Delivery
                        </div>
                        <div className="text-xs text-gray-500">
                          On all orders
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="p-1.5 bg-green-50 rounded-md">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          7 Days Returns
                        </div>
                        <div className="text-xs text-gray-500">
                          No question asked
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-400 lg:border-t-0 lg:bg-transparent lg:border-0">
            <div className="w-full px-2 sm:px-6 lg:px-8 py-3">
              <ActionButtons />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-100 bg-white p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="w-full md:w-auto">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customer reviews
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-3xl font-bold text-emerald-500">
                      {avgRating || "0.0"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-emerald-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(avgRating)
                                ? "text-emerald-400"
                                : "text-gray-500"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reviews.length} ratings
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto text-sm text-gray-500">
                  Reviews are view-only on this page.
                </div>
              </div>

              {/* Reviews list */}
              <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {reviews.length === 0 ? (
                  <div className="text-sm text-gray-500">No reviews yet.</div>
                ) : (
                  reviews.map((r, idx) => {
                    const reviewerName = r.user?.fullName?.firstName
                      ? `${r.user.fullName.firstName} ${
                          r.user.fullName.lastName || ""
                        }`
                      : r.user?.name || "User";
                    const initial = (reviewerName && reviewerName[0]) || "U";
                    const hash = reviewerName
                      .split("")
                      .reduce((a, c) => a + c.charCodeAt(0), 0);
                    const color = colors[hash % colors.length];

                    return (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 bg-gray-300/40 shadow-md border-2 border-gray-300/50 w-fit rounded-lg transition-transform cursor-help duration-300 hover:-translate-y-1">
                        <div
                          className={`flex-shrink-0 h-12 w-12 rounded-full border bg-${color}-100 flex items-center justify-center  font-semibold`}>
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-xs whitespace-nowrap text-gray-900">
                              {reviewerName}
                            </div>
                            <div className="flex text-emerald-400">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (r.rating || 0)
                                      ? "text-emerald-500"
                                      : "text-gray-500"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(
                                r.createdAt || Date.now()
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-lg italic text-gray-700 mt-2">
                            {r.comment}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="border-t border-gray-100 bg-white p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg lg:text-2xl uppercase border-b-4 border-double border-zinc-400 w-fit px-4 italic font-semibold text-gray-900 font-PublicSans">
                  More similar products
                </h3>
                <div className="text-sm text-gray-500">
                  Based on this product
                </div>
              </div>
              <div className="mt-4">
                {relatedProducts.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No related products found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {relatedProducts.map((p) => (
                      <motion.div
                        key={p._id}
                        whileHover={{ scale: 1.02 }}
                        className="w-full bg-white rounded-xl">
                        <ProductCard data={p} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDets;