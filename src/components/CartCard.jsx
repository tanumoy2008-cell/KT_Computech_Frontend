import React from "react";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import {
  addQuantity,
  reduceQuantity,
  removeProductFromCart,
} from "../Store/reducers/CartReducer";
import { motion } from "framer-motion";
import axios from "../config/axios";
import { toast } from "react-toastify";

const CartCard = ({ data }) => {
  const dispatch = useDispatch();

  const increaseQuantity = async (id) => {
  try {
    const res = await axios.post("/api/cart/increase-quantity", { productId: id });
    dispatch(addQuantity({ data: res.data.product }));
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Something went wrong";
    if (err.response?.status === 406) {
      toast.info(errorMessage);
    } else {
      toast.error(errorMessage);
    }
  }
};

  const decreaseQuantity = async (id) => {
    try{
      const res = await axios.post("/api/cart/decrease-quantity", {productId: id});
      dispatch(reduceQuantity({ data : res.data.product }));
    } catch (err){
      const errorMessage = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 406) {
        toast.info(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const cancelItem = (id) => {
    dispatch(removeProductFromCart({ _id: id }));
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col gap-4 border border-zinc-200"
    >
      {/* Product Image */}
      <div className="w-full h-48 rounded-lg overflow-hidden">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          src={data.productPic}
          alt={data.name}
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-lg md:text-xl font-PublicSans font-semibold text-zinc-800 line-clamp-2">
          {data.name}
        </h1>
        <div className="flex justify-between items-center text-zinc-700 font-Inter">
          <p className="text-lg font-semibold">₹{data.price}</p>
          <p className="text-sm text-zinc-500">
            Total: <span className="font-bold">₹{data.price * data.quantity}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => decreaseQuantity(data._id)}
          className="p-2 rounded-full bg-black/80 text-white active:bg-black active:scale-90 transition"
        >
          <RiSubtractFill className="text-lg" />
        </button>
        <input
          readOnly
          className="w-12 text-center font-Inter text-lg font-semibold border outline-none rounded-md"
          value={data.quantity}
          type="number"
        />
        <button
          onClick={() => increaseQuantity(data._id)}
          className="p-2 rounded-full bg-black/80 text-white active:bg-black active:scale-90 transition"
        >
          <IoMdAdd className="text-lg" />
        </button>
      </div>

      <button
        onClick={() => cancelItem(data._id)}
        className="w-full py-2 mt-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-PublicSans font-medium transition"
      >
        Remove
      </button>
    </motion.div>
  );
};

export default CartCard;
