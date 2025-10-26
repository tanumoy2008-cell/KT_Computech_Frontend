import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaChevronLeft, FaCartPlus, FaMapMarkerAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addProductToCart } from "../Store/reducers/CartReducer";
import calculateDiscountedPrice from "../utils/PercentageCalculate";

const ProductDets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkTimeout = useRef(null);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState("");
  const [pinColor, setPinColor] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState({ left: 0, top: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

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
      toast.error(err.response?.data?.message || "Error adding to cart");
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    try {
      const payload = {
        products: [
          {
            _id: product._id,
            name: product.name + (selectedColor ? ` (${selectedColor.Colorname})` : ""),
            price: product.price,
            quantity: 1,
            off: product.off || 0,
          },
        ],
        paymentMode: "UPI",
      };
      const res = await axios.post("/api/payment/online-order", payload);
      navigate("/order-payment", { state: { paymentResponse: res.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create order.");
    }
  };

  // Pin code check (debounced)
  useEffect(() => {
    if (!pin) {
      setPinResult("");
      setPinColor("");
      return;
    }

    clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.post("/api/pinCode/check-avaliable-pincode", { pin });
        const message = res.data.message;
        const available = !/not/i.test(message);
        setPinResult(message);
        setPinColor(available ? "text-green-500 font-semibold" : "text-red-500 font-semibold");
      } catch {
        setPinResult("Server error");
        setPinColor("text-red-500 font-semibold");
      }
    }, 1200);

    return () => clearTimeout(checkTimeout.current);
  }, [pin]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={handleNavigateBack}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="ml-4 text-lg font-medium text-gray-900 line-clamp-1">{product.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="w-full lg:w-1/2 p-4 md:p-8">
              <div 
                className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden group"
                ref={containerRef}
                onMouseEnter={(e) => {
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setContainerRect({ left: rect.left, top: rect.top });
                  }
                  setShowZoom(true);
                }}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={(e) => {
                  if (!imageRef.current) return;
                  
                  const { left, top, width, height } = imageRef.current.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  setZoomPosition({ x, y });
                  setCursorPosition({ 
                    x: e.clientX - containerRect.left, 
                    y: e.clientY - containerRect.top 
                  });
                }}
              >
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
                  <div 
                    className="fixed w-64 h-64 rounded-full overflow-hidden border-2 border-white/80 shadow-2xl pointer-events-none z-50 backdrop-blur-sm"
                    style={{
                      left: `${cursorPosition.x + 400}px`,
                      top: `${cursorPosition.y + 20}px`,
                      backgroundImage: `url(${selectedImage})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: `${imageRef.current ? imageRef.current.naturalWidth * 1.5 : 0}px ${imageRef.current ? imageRef.current.naturalHeight * 1.5 : 0}px`,
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
                        className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-200 hover:border-gray-300'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
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
            <div className="w-full lg:w-1/2 p-4 md:p-8 border-t lg:border-t-0 lg:border-l border-gray-100">
              <div className="space-y-6">
                {/* Brand & Rating */}
                <div className="space-y-2">
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {product.company || 'Premium Brand'}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <div className="flex items-center">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product.off > 0 ? calculateDiscountedPrice(product.price, product.off) : product.price}
                    </span>
                    {product.off > 0 && (
                      <>
                        <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                        <span className="bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                          {product.off}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {product.off > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      You save ₹{product.price - calculateDiscountedPrice(product.price, product.off)}
                    </div>
                  )}
                </div>

                {/* Color Picker */}
                {product.colorVariants?.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Color: <span className="font-semibold">{selectedColor?.Colorname || 'Select'}</span>
                      </h3>
                      <span className="text-xs text-gray-500">{product.colorVariants.length} options</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colorVariants.map((color, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleColorSelect(color)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedColor?.Colorname === color.Colorname
                              ? 'ring-2 ring-offset-1 ring-green-400 border-white shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.colorCode || '#ccc' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={color.Colorname}
                        >
                          {selectedColor?.Colorname === color.Colorname && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <div className="prose prose-sm text-gray-600">
                    {Array.isArray(product.description) ? (
                      <ul className="space-y-1">
                        {product.description.map((desc, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                      <h4 className="font-medium text-gray-900">Delivery & Returns</h4>
                      <p className="text-sm text-gray-500">Check estimated delivery date</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        placeholder="Enter PIN code"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-transparent outline-none text-sm"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Free Delivery</div>
                        <div className="text-xs text-gray-500">On all orders</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="p-1.5 bg-green-50 rounded-md">
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">7 Days Returns</div>
                        <div className="text-xs text-gray-500">No question asked</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 lg:border-t-0 lg:bg-transparent lg:border-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-3 flex gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 lg:max-w-xs flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 rounded-xl text-green-700 font-semibold hover:bg-green-50 transition-colors"
                >
                  <FaCartPlus className="h-5 w-5" />
                  <span>Add to Cart</span>
                </motion.button>
                
                <motion.button
                  onClick={handleBuyNow}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 lg:max-w-xs bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
};

export default ProductDets;