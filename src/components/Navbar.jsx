import React, { memo, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import { HiMiniShoppingCart } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { IoTrash } from "react-icons/io5";
import { removeProductFromCart } from "../Store/reducers/CartReducer";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [MenuShow, setMenuShow] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidemenu, setsidemenu] = useState(false);
  const cart = useSelector((state) => state.CartReducer);

  const cancelItem = (id) => {
    dispatch(removeProductFromCart({ _id: id }));
  };

  return (
    <div className="w-full fixed bg-black text-amber-400 top-0 z-[999]">
      {/* -------- Mobile Navbar -------- */}
      <div className="w-full py-2 px-4 flex lg:hidden items-center justify-between">
        {/* Side menu (categories) */}
        <AnimatePresence>
          {sidemenu && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              className="absolute flex flex-col justify-center gap-y-10 top-0 shadow-2xl shadow-black 
              text-center text-3xl bg-white w-full h-screen z-[99]"
            >
              <button
                onClick={() => setsidemenu(false)}
                className="absolute top-5 left-5 font-ArvoBold uppercase text-xl bg-black text-amber-400 px-10 py-2 rounded"
              >
                Back
              </button>
              {[
                { name: "School Stationery", link: "/product/school" },
                { name: "Office Stationery", link: "/product/office" },
                { name: "Art & Craft Items", link: "/product/art" },
                { name: "Gift Items", link: "/product/gift" },
                { name: "House Hold Products", link: "/product/house" },
                { name: "All Products", link: "/product/all" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  onClick={() => setsidemenu(false)}
                  className="cursor-pointer py-2 px-2 hover:bg-zinc-300"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo */}
        <div className="flex items-center gap-x-2">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400">
            <img
              className="w-full h-full object-cover shadow-2xl"
              src="/Logo.webp"
              alt="logo"
            />
          </div>
          <h1 className="text-xl uppercase font-ArvoBold">KT Computech</h1>
        </div>

        {/* Cart + Menu */}
        <div className="flex items-center gap-x-4">
          <div className="relative w-fit h-fit py-2">
            {cart.length !== 0 && (
              <small className="bg-red-600 absolute text-white text-sm px-2 rounded-full -top-2 -right-3 leading-4 py-1">
                {cart.length}
              </small>
            )}
            <HiMiniShoppingCart
              onClick={() => navigate("/user/cart")}
              className="text-4xl text-amber-400 cursor-pointer"
            />
          </div>
          <IoMdMenu
            onClick={() => setMenuShow(true)}
            className="text-4xl text-amber-400 cursor-pointer"
          />
        </div>

        {/* Main menu */}
        <AnimatePresence>
          {MenuShow && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4 }}
              className="fixed w-full h-screen top-0 right-0 bg-white z-[100]"
            >
              <IoClose
                onClick={() => setMenuShow(false)}
                className="absolute top-10 right-10 text-5xl cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-y-20 uppercase font-semibold text-4xl w-full h-full">
                <Link to="/user" onClick={() => setMenuShow(false)}>
                  Profile
                </Link>
                <Link to="/" onClick={() => setMenuShow(false)}>
                  Home
                </Link>
                <h1 onClick={() => setsidemenu(true)}>Product</h1>
                <h1>About</h1>
                <h1>Contact Us</h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* -------- Desktop Navbar -------- */}
      <div className="hidden lg:flex justify-between items-center w-full pl-10 md:pr-10 xl:pr-30 py-1">
        {/* Logo */}
        <div className="flex gap-x-4 items-center">
          <div className="w-15 h-15 overflow-hidden rounded-full border-2 border-amber-400">
            <img
              className="w-full h-full object-cover scale-110 shadow-2xl"
              src="/Logo.webp"
              alt=""
            />
          </div>
          <h1 className="text-3xl uppercase font-ArvoBold">KT Computech</h1>
        </div>

        {/* Links */}
        <div className="flex font-Geist text-center items-center md:text-xl">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="border-r w-40 2xl:w-50 pr-4 cursor-pointer">
              Home
            </Link>
          </motion.div>

          <div className="border-r w-30 2xl:w-50 cursor-pointer relative group">
            <Link to={`/product/all`}>Product</Link>
            <div className="absolute top-[100%] left-0 bg-white text-black hidden group-hover:flex flex-col shadow-lg">
              {[
                { name: "School Stationery", link: "/product/school" },
                { name: "Office Stationery", link: "/product/office" },
                { name: "Art & Craft Items", link: "/product/art" },
                { name: "Gift Items", link: "/product/gift" },
                { name: "House Hold Products", link: "/product/house" },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  className="cursor-pointer border-b whitespace-nowrap py-2 px-10 hover:bg-zinc-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <motion.h1 whileHover={{ scale: 1.05 }} className="border-r w-30 cursor-pointer">
            About
          </motion.h1>
          <motion.h1 whileHover={{ scale: 1.05 }} className="w-30 cursor-pointer">
            Contact Us
          </motion.h1>

          {/* Profile + Cart */}
          <div className="h-full flex ml-5 items-center gap-x-5">
            <abbr title="Profile">
              <FaRegUserCircle
                onClick={() => navigate("/user")}
                className="cursor-pointer text-2xl"
              />
            </abbr>

            <div className="relative w-fit h-fit group py-2">
              {cart.length !== 0 && (
                <small className="bg-red-600 absolute text-white text-sm px-2 rounded-full -top-2 -right-3 leading-4 py-[2px]">
                  {cart.length}
                </small>
              )}
              <HiMiniShoppingCart
                onClick={() => navigate("/user/cart")}
                className="cursor-pointer text-2xl"
              />

              {/* Cart Dropdown */}
              <AnimatePresence>
                {cart.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 p-2 hidden group-hover:flex flex-col gap-y-2 bg-white shadow-2xl border border-black/30"
                  >
                    <div className="max-h-[40vh] overflow-y-auto">
                      {cart.map((items, index) => (
                        <div
                          key={index}
                          className="w-full cursor-pointer border flex p-2 items-center justify-between gap-x-4 rounded-md text-black"
                        >
                          <div className="w-16 h-16 overflow-hidden rounded-md border">
                            <img
                              className="w-full h-full object-cover"
                              src={items.productPic}
                              alt=""
                            />
                          </div>
                          <div
                            onClick={() =>
                              navigate(`/product-dets/${items._id}`)
                            }
                            className="flex flex-col items-start"
                          >
                            <p className="text-sm lg:text-lg">
                              {items.name.slice(0, 15)}...
                            </p>
                            <small>
                              ₹{calculateDiscountedPrice(items.price, items.off)}
                            </small>
                          </div>
                          <button
                            onClick={() => cancelItem(items._id)}
                            className="bg-black text-amber-400 h-10 w-10 rounded-md flex justify-center items-center text-xl"
                          >
                            <IoTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/user")}
                      className="w-full py-2 bg-black text-amber-400 rounded-md font-ArvoBold"
                    >
                      Buy Now
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 py-2 px-4 text-black hidden group-hover:flex bg-white shadow-2xl border border-black/30"
                  >
                    <h1 className="text-lg font-ArvoBold">
                      No Product added in cart
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Navbar);
