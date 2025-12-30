import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addProductToCart } from "../Store/reducers/CartReducer";

const ProductCard = ({ data, variant = 'comfortable' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.UserReducer);
  const clickHandel = async (id) => {
    try {
      await axios.patch(`/api/product/click/${id}`);
    } catch (err) {
      console.error("Error updating click count:", err);
    }
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // Calculate discounted price if there's a discount
  // Normalize discount/"off" value from possible backend fields and types
  const rawOff = data.off ?? data.discount ?? data.discountPercent ?? data.offPercent ?? 0;
  const off = Number(rawOff) || 0;

  // Calculate discounted price if there's a discount
  const displayPrice = off > 0
    ? calculateDiscountedPrice(data.price, off)
    : data.price;

    // variations for different UI modes
    const comfortableClasses = "group relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-500/50";
    const compactClasses = "group relative w-full h-full bg-white rounded-xl overflow-hidden shadow-md transition-all duration-200 border border-gray-200";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={variant === "comfortable" ? { y: -5 } : {}}
        transition={{ duration: 0.25 }}
        className={variant === "compact" ? compactClasses : comfortableClasses}>
        <Link
          to={`/product-dets/${data._id}`}
          onClick={() => clickHandel(data._id)}
          className="block h-full">
          {/* Badge */}
          {off > 0 && (
            <span
              className={`${
                variant === "list" ? "absolute" : "absolute top-4 right-4"
              } z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6`}>
              {off}% OFF
            </span>
          )}

          {/* Image Container */}
          <div
            className={`relative overflow-hidden bg-gray-100 ${
              variant === "compact"
                ? "h-40"
                : variant === "list"
                ? "w-28 h-28 flex-shrink-0"
                : "h-64"
            } border-b-1 border-zinc-500/70`}>
            <motion.img
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className={`${
                variant === "compact"
                  ? "w-full h-full object-cover rounded"
                  : "w-full h-full object-cover transition-transform duration-500"
              }`}
              src={data.productPic || data.images}
              alt={data.name}
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/70 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white"
                title="Quick View">
                <Eye size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/70 text-red-500 p-2 rounded-full shadow-lg hover:bg-white"
                title="Add to Wishlist">
                <Heart size={18} />
              </motion.button>
            </div>
          </div>

          {/* Product Info */}
          <div
            className={`${
              variant === "compact"
                ? "p-3"
                : variant === "list"
                ? "flex-1 p-0 pl-4"
                : "p-4"
            }`}>
            {/* Category & Company */}
            <div
              className={`flex ${
                variant === "list"
                  ? "justify-start items-center gap-3 mb-1"
                  : "justify-between items-center mb-1"
              }`}>
              <span
                className={`text-xs text-gray-700 font-bold uppercase tracking-wider ${
                  variant === "compact" ? "text-[11px]" : ""
                }`}>
                {data.Subcategory || "Category"}
              </span>
              <span
                className={`text-sm font-semibold text-emerald-700 uppercase bg-emerald-100 px-2 py-1 rounded ${
                  variant === "compact" ? "text-xs px-1 py-0.5" : ""
                }`}>
                {data.company}
              </span>
            </div>

            {/* Product Name */}
            <h3
              className={`font-semibold text-gray-800 mb-2 line-clamp-2 ${
                variant === "compact"
                  ? "text-sm h-10"
                  : variant === "list"
                  ? "text-base"
                  : "h-12 flex items-center"
              }`}>
              {data.name}
            </h3>

            {/* Price & CTA */}
            <div
              className={`${
                variant === "list"
                  ? "flex items-center justify-between mt-0"
                  : "flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-400"
              }`}>
              <div>
                <span className="text-xl font-bold text-gray-900">
                  ₹{formatPrice(displayPrice)}
                </span>
                {data.off > 0 && (
                  <span className="ml-1 text-xs text-gray-500 line-through">
                    ₹{formatPrice(data.price)}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={
                  variant === "compact"
                    ? "flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    : variant === "list"
                    ? "flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                    : "flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                }
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!user) {
                    toast.warning("Please login to add items to cart");
                    navigate("/user/login", {
                      state: { from: window.location.pathname },
                    });
                    return;
                  }

                  try {
                    // Call API to add to cart
                    await axios.post("/api/cart/add-product-in-cart", {
                      productId: data._id,
                      color: data.color || "",
                    });

                    // Update Redux store
                    dispatch(
                      addProductToCart({
                        ...data,
                        quantity: 1,
                        color: data.color || "",
                        displayPrice: displayPrice,
                      })
                    );

                    toast.success("Added to cart successfully!");

                    // Dispatch cart update event
                    window.dispatchEvent(new Event("cartUpdated"));
                  } catch (error) {
                    console.error("Error adding to cart:", error);
                    toast.error(
                      error.response?.data?.message || "Failed to add to cart"
                    );
                  }
                }}>
                <ShoppingCart size={16} />
                <span className={`${variant === "compact" ? "text-sm" : ""}`}>
                  Add to Cart
                </span>
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
};

export default ProductCard;
