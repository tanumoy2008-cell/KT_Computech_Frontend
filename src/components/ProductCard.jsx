import { Link } from "react-router-dom";
import axios from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import calculateDiscountedPrice from "../utils/PercentageCalculate";

const ProductCard = ({ data }) => {
  console.log(data)
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
  const displayPrice = data.off > 0 
    ? calculateDiscountedPrice(data.price, data.off)
    : data.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <Link to={`/product-dets/${data._id}`} onClick={() => clickHandel(data._id)} className="block h-full">
        {/* Badge */}
        {data.off > 0 && (
          <span className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6">
            {data.off}% OFF
          </span>
        )}
        
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 h-64">
          <motion.img
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover transition-transform duration-500"
            src={data.productPic}
            alt={data.name}
            loading="lazy"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white"
              title="Quick View"
            >
              <Eye size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:bg-white"
              title="Add to Wishlist"
            >
              <Heart size={18} />
            </motion.button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category & Company */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-700 font-bold uppercase tracking-wider">
              {data.Subcategory || 'Category'}
            </span>
            <span className="text-sm font-semibold text-green-600 uppercase bg-green-50 px-2 py-1 rounded">
              {data.company}
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 flex items-center">
            {data.name}
          </h3>
          
          {/* Price & CTA */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-gray-900">₹{formatPrice(displayPrice)}</span>
              {data.off > 0 && (
                <span className="ml-2 text-sm text-gray-400 line-through">
                  ₹{formatPrice(data.price)}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
