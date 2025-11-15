import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import axios from "../config/axios";
import { toast } from "react-toastify";

import {
  addQuantity,
  reduceQuantity,
  removeProductFromCart,
  setCart,
} from "../Store/reducers/CartReducer";

import { FiPlus, FiMinus, FiX, FiLoader } from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import calculateDiscountedPrice from "../utils/PercentageCalculate";

const CartCard = ({ item, onRemove }) => {
  if (!item) return null;

  const {
    _id,
    name,
    price = 0,
    off = 0,
    quantity = 1,
    color,
    image,
    company,
  } = item;

  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState({
    increase: false,
    decrease: false,
  });

  // Refresh helper (always adapts to backend array shape)
  const refreshCart = useCallback(async () => {
    try {
      const r = await axios.get("/api/cart/send-cart-info");
      if (r.status === 200) {
        dispatch(setCart({ items: Array.isArray(r.data?.cart) ? r.data.cart : [] }));
      }
    } catch (e) {
      // silent fail
    }
  }, [dispatch]);

  // DELETE ITEM  -> DELETE /delete-product  (returns { message })
  const removeItem = useCallback(async () => {
    try {
      setIsRemoving(true);

      const res = await axios.delete("/api/cart/delete-product", {
        data: { productId: _id, color },
      });

      if (res.status === 200) {
        // Optimistic remove
        dispatch(removeProductFromCart({ _id, color }));
        onRemove && onRemove();
        toast.success(res.data?.message || "Item removed");
      } else {
        throw new Error(res.data?.message || "Failed to remove item");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove item");
      await refreshCart();
    } finally {
      setIsRemoving(false);
    }
  }, [_id, color, dispatch, onRemove, refreshCart]);

  // INCREASE QUANTITY -> PATCH /increase-quantity (returns { message, product })
  const increaseQuantity = useCallback(async () => {
    try {
      setIsUpdating((p) => ({ ...p, increase: true }));

      const res = await axios.patch("/api/cart/increase-quantity", {
        productId: _id,
        color,
      });

      if (res.status === 200) {
        // Optimistic local increment
        dispatch(addQuantity({ _id, color }));
        // Optionally use res.data.product to verify/adjust in future
      } else {
        throw new Error(res.data?.message || "Increase failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to increase quantity");
      await refreshCart();
    } finally {
      setIsUpdating((p) => ({ ...p, increase: false }));
    }
  }, [_id, color, dispatch, refreshCart]);

  // DECREASE QUANTITY -> PATCH /decrease-quantity (returns { message, cart })
  const decreaseQuantity = useCallback(async () => {
    if (quantity <= 1) return;

    try {
      setIsUpdating((p) => ({ ...p, decrease: true }));

      const res = await axios.patch("/api/cart/decrease-quantity", {
        productId: _id,
        color,
      });

      if (res.status === 200) {
        // Backend returns the full cart array here — trust server source of truth
        const serverCart = Array.isArray(res.data?.cart) ? res.data.cart : [];
        dispatch(setCart({ items: serverCart }));
      } else {
        throw new Error(res.data?.message || "Decrease failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to decrease quantity");
      await refreshCart();
    } finally {
      setIsUpdating((p) => ({ ...p, decrease: false }));
    }
  }, [_id, color, quantity, dispatch, refreshCart]);

  // Price calculation
  const discountedPrice = calculateDiscountedPrice(Number(price) || 0, Number(off) || 0);
  const totalPrice = (discountedPrice * (Number(quantity) || 0)).toFixed(2);
  const originalPrice = ((Number(price) || 0) * (Number(quantity) || 0)).toFixed(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      <div className="flex">
        {/* IMAGE */}
        <div className="h-24 w-24 border rounded-md overflow-hidden">
          {image ? (
            <img src={image} alt={name} className="object-cover h-full w-full" />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <BsBoxSeam className="text-gray-400 text-3xl" />
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="ml-4 flex flex-col flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-semibold">{name}</h3>
              <p className="text-xs text-gray-500">{company}</p>
              <div className="flex items-center mt-1">
                <span
                  className="h-3 w-3 rounded-full border mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-500">{color}</span>
              </div>
            </div>

            <button
              onClick={removeItem}
              disabled={isRemoving}
              className="text-gray-400 hover:text-red-500"
            >
              {isRemoving ? <FiLoader className="animate-spin" /> : <FiX />}
            </button>
          </div>

          {/* PRICE + QUANTITY */}
          <div className="flex justify-between items-end mt-3">
            {/* QUANTITY */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={decreaseQuantity}
                disabled={isUpdating.decrease || quantity <= 1}
                className="p-2"
              >
                {isUpdating.decrease ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiMinus />
                )}
              </button>

              <span className="px-3">{quantity}</span>

              <button
                onClick={increaseQuantity}
                disabled={isUpdating.increase}
                className="p-2"
              >
                {isUpdating.increase ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiPlus />
                )}
              </button>
            </div>

            {/* PRICE */}
            <div className="text-right">
              {off > 0 && (
                <p className="text-xs line-through text-gray-400">₹{originalPrice}</p>
              )}
              <p className="text-sm font-bold">₹{totalPrice}</p>
              {off > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                  {off}% OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartCard;
