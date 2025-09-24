import { Link } from "react-router-dom";
import axios from "../config/axios";
import { motion } from "framer-motion";

const ProductCard = ({ data }) => {
  const clickHandel = async (id) => {
    try {
      await axios.patch(`/api/product/click/${id}`);
    } catch (err) {
      console.error("Error updating click count:", err);
    }
  };

  return (
    <Link
      to={`/product-dets/${data._id}`}
      onClick={() => clickHandel(data._id)}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="w-full h-full bg-green-200 border border-green-200 p-4 rounded-2xl flex flex-col gap-y-3 justify-between shadow-md hover:shadow-xl hover:bg-green-300 overflow-hidden relative"
      >
        {/* Company Badge */}
        <span className="absolute top-3 left-3 z-20 border bg-green-200 text-green-900 text-xs font-semibold px-4 py-1 rounded-bl-full rounded-tr-full shadow-sm">
          {data.company}
        </span>

        {/* Image */}
        <div className="w-full h-56 rounded-xl border border-green-500 overflow-hidden relative">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
            src={data.productPic}
            alt={data.name}
          />
          {/* Soft Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-y-1 items-center text-center">
          <h1 className="text-lg md:text-xl font-Jura font-bold line-clamp-2 text-gray-800">
            {data.name}
          </h1>
        </div>

        {/* Price + Buy Button */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-xl font-bold text-green-800">
            ₹ {data.price}/-
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ backgroundColor: "#065f46" }}
            className="bg-green-700 px-5 py-2 rounded-full cursor-pointer text-white font-Jura text-sm shadow hover:shadow-md transition"
          >
            Buy Now
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
