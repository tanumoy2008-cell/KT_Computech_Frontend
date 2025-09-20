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
    <Link to={`/product-dets/${data._id}`} onClick={() => clickHandel(data._id)}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full bg-white border border-[#006A4E] p-4 rounded-2xl flex flex-col gap-y-1 justify-between group shadow hover:shadow-xl"
      >
        {/* Image */}
        <div className="w-full h-60 border rounded-xl overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover contrast-110 brightness-75"
            src={data.productPic}
            alt={data.name}
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl font-Jura font-bold">{data.name}</h1>

        {/* Price Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ backgroundColor: "#004d36" }}
          className="bg-[#006A4E] py-2 rounded-full text-white font-Jura text-xl text-center cursor-pointer"
        >
          ₹ {data.price}/-
        </motion.button>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
