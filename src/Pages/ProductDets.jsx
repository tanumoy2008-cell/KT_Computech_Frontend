import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../config/axios";
import { FaLongArrowAltLeft } from "react-icons/fa";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { useDispatch } from "react-redux";
import { addProductToCart } from "../Store/reducers/CartReducer";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const ProductDets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [Product, setProduct] = useState({});
  const [pinCode, setPinCode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinColor, setPinColor] = useState("");

  const fetchData = async () => {
    const res = await axios.get(`/api/product/productDetail/${id}`);
    setProduct(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const newPrice = calculateDiscountedPrice(Product.price, Product.off);

  const handelProductCart = (product) => {
    dispatch(addProductToCart(product));
  };

  const cheackPinCode = async () => {
    if (!pinCode || pinCode.toString().length !== 6) {
      setPinMessage("Enter a valid 6-digit PinCode.");
      setPinColor("text-red-500");
      return;
    }

    try {
      const result = await axios.post(
        "/api/pinCode/check-avaliable-pincode",
        { pinCode }
      );
      setPinMessage(result.data.message);
      setPinColor(
        result.data.message.includes("Not")
          ? "text-red-500 text-lg font-Geist font-semibold"
          : "text-green-700 text-lg font-Geist font-semibold"
      );
    } catch (error) {
      setPinMessage("Server error, please try again.");
      setPinColor("text-red-500 text-lg font-Geist font-semibold");
    }
  };

  return (
    <div id="productDets" className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-5 z-40 bg-black text-white rounded px-6 py-2 flex items-center gap-x-3 shadow-lg hover:scale-105 transition-transform"
      >
        <FaLongArrowAltLeft /> Back
      </button>

      {Object.keys(Product).length === 0 ? (
        // Skeleton Loader
        <div className="w-full pt-32 pb-10 px-5 md:px-20 lg:px-32 2xl:px-40">
          <div className="flex flex-col lg:flex-row gap-10">
            <motion.div
              className="w-full lg:w-[50%] h-[400px] bg-gray-300 animate-pulse rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <div className="flex flex-col gap-6 w-full lg:w-[50%]">
              <h1 className="text-5xl font-ArvoBold opacity-30 animate-pulse">
                Product Name
              </h1>
              {Array.from({ length: 4 }).map((_, i) => (
                <p
                  key={i}
                  className="text-2xl opacity-30 animate-pulse bg-gray-300 h-6 w-3/4 rounded"
                />
              ))}
              <div className="flex gap-4">
                <div className="bg-gray-400 h-12 w-32 animate-pulse rounded" />
                <div className="bg-gray-400 h-12 w-32 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Product Details
        <div className="w-full pt-32 pb-10 px-5 md:px-20 lg:px-32 2xl:px-40">
          <div className="flex flex-col xl:flex-row gap-10">
            {/* Image Section */}
            <motion.div
              className="flex-1 shadow-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border">
              <img
                src={Product.productPic}
                alt={Product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                </div>
              <div className="bg-amber-300 py-3 px-4 mt-5 rounded-lg border-2 border-amber-900">
                <h1 className="font-ArvoBold uppercase text-xl">Note:</h1>
                <p className="font-Geist text-lg">
                  We always try our best to deliver the product in the same
                  color as shown in the images. However, due to availability,
                  sometimes the color may vary. Rest assured, the product
                  quality and features will remain the same. 🙏
                </p>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="flex-1 flex flex-col gap-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-5xl font-ArvoBold font-semibold">
                {Product.name}
              </h1>
              <p className="text-3xl font-semibold">
                {Product.off !== 0 && (
                  <del className="text-zinc-500 mr-2">₹{Product.price}/-</del>
                )}
                ₹{newPrice}/-
                {Product.off !== 0 && (
                  <sup className="text-green-600 ml-2">{Product.off}% Off</sup>
                )}
              </p>

              {/* Description */}
              <div className="flex flex-col gap-2">
                {Product.description?.map((item, i) => (
                  <motion.p
                    key={i}
                    className="text-lg font-Jura cursor-pointer hover:font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    ※ {item}
                  </motion.p>
                ))}
              </div>

              {/* Pin Code */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-xl font-ArvoBold">Check Delivery Details</h1>
                <div className="flex gap-3 items-end">
                  <div className="w-[70%]">
                    <small className={pinColor}>{pinMessage}</small>
                    <input
                      onChange={(e) => setPinCode(e.target.value)}
                      value={pinCode}
                      type="number"
                      placeholder="Enter your PinCode..."
                      className="border w-full py-2 px-3 rounded text-lg outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={cheackPinCode}
                    className="bg-blue-600 px-6 py-2 text-white rounded hover:scale-105 transition-transform"
                  >
                    Check
                  </button>
                </div>
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-black text-white py-3 rounded-full text-lg"
                >
                  Buy Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    handelProductCart(Product);
                    toast.success("Product Added to Cart");
                  }}
                  className="bg-black text-white py-3 rounded-full text-lg"
                >
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDets;
