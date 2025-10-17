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
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pinCode, setPinCode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinColor, setPinColor] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/product/productDetail/${id}`);
      setProduct(res.data);

      if (res.data.colorVariants && res.data.colorVariants.length > 0) {
        const firstColor = res.data.colorVariants[0];
        setSelectedColor(firstColor);
        setSelectedImage(firstColor.images?.[0] || "/placeholder.png");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product details.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const newPrice = calculateDiscountedPrice(Product.price, Product.off);

  const handelProductCart = async () => {
    try {
      const res = await axios.post("/api/cart/add-product-in-cart", { productId: Product._id });
      dispatch(addProductToCart(res.data.cart));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding to cart");
    }
  };

  const cheackPinCode = async () => {
    if (!pinCode || pinCode.toString().length !== 6) {
      setPinMessage("Enter a valid 6-digit PinCode.");
      setPinColor("text-red-500");
      return;
    }

    try {
      const result = await axios.post("/api/pinCode/check-avaliable-pincode", { pinCode });
      setPinMessage(result.data.message);
      setPinColor(
        result.data.message.includes("Not")
          ? "text-red-400 text-lg font-semibold"
          : "text-green-400 text-lg font-semibold"
      );
    } catch (error) {
      setPinMessage("Server error, please try again.");
      setPinColor("text-red-500 font-semibold");
    }
  };

  const productSendOnOrderSummery = () => {
    const createOrder = async () => {
      try {
        const payload = {
          products: [
            {
              _id: Product._id,
              name: Product.name + (selectedColor ? ` (${selectedColor.name})` : ""),
              price: Product.price,
              quantity: 1,
              off: Product.off || 0,
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
    createOrder();
  };

  return (
    <div id="productDets" className="w-full min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      <Navbar />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-5 z-40 bg-white border border-gray-300 rounded-full px-5 py-2 flex items-center gap-x-2 shadow-md hover:shadow-lg transition"
      >
        <FaLongArrowAltLeft /> Back
      </button>

      {/* Loading Skeleton */}
      {Object.keys(Product).length === 0 ? (
        <div className="w-full pt-32 pb-10 px-5 md:px-20 lg:px-32 2xl:px-40">
          <div className="flex flex-col lg:flex-row gap-10">
            <motion.div
              className="w-full lg:w-[50%] h-[400px] bg-gray-200 animate-pulse rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <div className="flex flex-col gap-6 w-full lg:w-[50%]">
              <h1 className="text-4xl font-PublicSans opacity-30 animate-pulse">Loading...</h1>
              {Array.from({ length: 4 }).map((_, i) => (
                <p key={i} className="text-xl opacity-30 animate-pulse bg-gray-200 h-6 w-3/4 rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full pt-32 pb-16 px-5 md:px-20 lg:px-32 2xl:px-40">
          <div className="flex flex-col xl:flex-row gap-12">

            {/* LEFT: Main Image */}
            <motion.div className="flex-1" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={selectedImage || "/placeholder.png"}
                  alt={Product.name}
                  className="w-full h-full object-cover hover:scale-105 brightness-90 transition-transform duration-300"
                />
              </div>

              {/* Image Thumbnails */}
              {selectedColor?.images?.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {selectedColor.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`thumbnail-${idx}`}
                      className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                        selectedImage === img ? "border-black" : "border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}

              {/* Note */}
              <div className="bg-gray-100 py-2 px-6 mt-6 border-l-5 rounded-lg border border-black shadow-sm">
                <h1 className="font-Inter font-semibold uppercase text-lg text-black">Note:</h1>
                <p className="font-PublicSans text-base text-black mt-1 leading-relaxed">
                  We try our best to deliver products as shown. Due to availability, colors may slightly vary — but quality and
                  features remain the same. 🙏
                </p>
              </div>
            </motion.div>

            {/* RIGHT: Details */}
            <motion.div className="flex-1 flex flex-col gap-6" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl sm:text-4xl font-PublicSans font-semibold text-white">
                {Product.name} {selectedColor && `(${selectedColor.Colorname})`}
              </h1>

              {/* Price */}
              <p className="text-2xl font-semibold text-white">
                {Product.off !== 0 && <del className="text-white/50 mr-2">₹{Product.price}/-</del>}
                ₹{newPrice}/-
                {Product.off !== 0 && (
                  <sup className="text-green-700 ml-2 text-base">{Product.off}% Off</sup>
                )}
              </p>

              {/* Color Variant Selector */}
              {Product.colorVariants && Product.colorVariants.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h1 className="font-PublicSans text-white/70 text-lg">Available Colors:</h1>
                  <div className="flex gap-3">
                    {Product.colorVariants.map((color, i) => (
                      <motion.div
                        key={i}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedImage(color.images?.[0] || "/placeholder.png");
                        }}
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 rounded-full border-2 cursor-pointer shadow-sm ${
                          selectedColor?.name === color.name ? "border-black scale-105" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.colorCode }}
                        title={color.Colorname}
                      ></motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="flex flex-col gap-2 text-white">
                {Product.description?.map((item, i) => (
                  <motion.p
                    key={i}
                    className="text-base font-Jura flex items-start gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <span>•</span> {item}
                  </motion.p>
                ))}
              </div>

              {/* Pin Code */}
              <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <h1 className="text-lg font-PublicSans text-white">Check Delivery Availability</h1>
                <div className="flex gap-3 items-end">
                  <div className="w-[70%]">
                    <small className={pinColor}>{pinMessage}</small>
                    <input
                      onChange={(e) => setPinCode(e.target.value)}
                      value={pinCode}
                      type="number"
                      placeholder="Enter your PinCode..."
                      className="border border-gray-300 w-full py-2 px-3 rounded-lg text-base outline-none bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={cheackPinCode}
                    className="bg-black px-6 py-2 text-white rounded-lg hover:bg-black/80 transition"
                  >
                    Check
                  </button>
                </div>
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 mt-6">
                <motion.button
                  onClick={productSendOnOrderSummery}
                  whileHover={{ scale: 1.03 }}
                  className="bg-black text-white py-3 rounded-lg text-lg shadow hover:bg-black/80"
                >
                  Buy Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={handelProductCart}
                  className="bg-white text-gray-900 py-3 rounded-lg text-lg border border-gray-300 shadow hover:bg-gray-100"
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
