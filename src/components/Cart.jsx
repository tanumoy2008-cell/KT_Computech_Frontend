import React, { useEffect, useState } from "react";
import CartCard from "./CartCard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import emptyCart from "../assets/Empty Box Animation.json";
import axios from "../config/axios";
import { setCart } from "../Store/reducers/CartReducer";

const Cart = () => {
  const cart = useSelector((state) => state.CartReducer);
  const [carts, setCarts] = useState(cart);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    setCarts(cart);
  }, [cart]);

  useEffect(()=>{
    const fetchCart = async ()=>{
      const res = await axios.get("/api/cart/send-cart-info")
      dispatch(setCart(res.data.cart))
    }
    fetchCart()
  },[])

  return (
    <div className="flex flex-col h-screen w-full px-5 md:px-8 py-3">

      <div className="flex justify-between items-center pb-4 border-b sticky top-0 z-20">
        <h1 className="font-PublicSans text-3xl lg:text-5xl font-bold tracking-tight">
          Your Cart
        </h1>
        <div className="flex gap-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-800 text-white px-6 md:px-10 py-2 rounded-md font-PublicSans text-base md:text-lg"
            onClick={() => navigate("/product/all")}
          >
            Add More
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-green-700 hover:bg-green-800 text-white px-6 md:px-10 py-2 rounded-md font-PublicSans text-base md:text-lg"
          >
            Buy Now
          </motion.button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="w-full mt-2 flex-1 overflow-y-auto">
        {carts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <Lottie
            animationData={emptyCart}
            loop={true}
            className="w-48 md:w-64 opacity-80 -mb-15"
            />
            <h2 className="mt-6 text-2xl font-PublicSans font-semibold text-zinc-700">
              Your cart is empty
            </h2>
            <p className="text-zinc-500 mt-2">
              Looks like you haven’t added anything yet.
            </p>
            <button
              onClick={() => navigate("/product/all")}
              className="mt-6 bg-zinc-900 text-white px-6 py-2 rounded-md font-PublicSans hover:bg-zinc-700"
            >
              Shop Now
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {carts.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <CartCard data={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
