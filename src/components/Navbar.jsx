import React, { memo, useState, useRef } from "react";
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
  const [sidemenu, setsidemenu] = useState(false);
  const [productHover, setProductHover] = useState(false);
  const hoverTimeout = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.CartReducer);

  const cancelItem = (id) => {
    dispatch(removeProductFromCart({ _id: id }));
  };

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Contact Us", to: "/contact" },
  ];

  const productLinks = [
    { name: "School Stationery", link: "/product/school" },
    { name: "Office Stationery", link: "/product/office" },
    { name: "Art & Craft Items", link: "/product/art" },
    { name: "Gift Items", link: "/product/gift" },
    { name: "House Hold Products", link: "/product/house" },
    { name: "All Products", link: "/product/all" },
  ];

  // Hover delay handlers
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setProductHover(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setProductHover(false);
    }, 300); // 👈 delay before hiding
  };

  return (
    <div className="fixed top-0 z-[999] w-full bg-emerald-800 text-amber-400 shadow-lg">
      {/* MOBILE + TABLET */}
      <div className="flex items-center justify-between px-4 py-2 lg:hidden">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-x-2 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400">
            <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold uppercase">KT Computech</h1>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-x-4">
          <div className="relative">
            {cart.length > 0 && (
              <small className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </small>
            )}
            <HiMiniShoppingCart
              onClick={() => navigate("/user/cart")}
              className="text-3xl cursor-pointer"
            />
          </div>

          <IoMdMenu
            onClick={() => setMenuShow(true)}
            className="text-3xl cursor-pointer"
          />
        </div>

        {/* MAIN MOBILE MENU */}
        <AnimatePresence>
          {MenuShow && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 w-full h-screen bg-black/60 backdrop-blur-lg z-[100] flex flex-col items-center justify-center text-3xl gap-10"
            >
              <IoClose
                onClick={() => setMenuShow(false)}
                className="absolute top-8 right-8 text-5xl cursor-pointer"
              />
              <Link to="/user" onClick={() => setMenuShow(false)}>
                Profile
              </Link>
              <Link to="/" onClick={() => setMenuShow(false)}>
                Home
              </Link>
              <h1
                onClick={() => {
                  setsidemenu(true);
                  setMenuShow(false);
                }}
                className="cursor-pointer"
              >
                Product
              </h1>
              <Link to="/about" onClick={() => setMenuShow(false)}>
                About
              </Link>
              <Link to="/contact" onClick={() => setMenuShow(false)}>
                Contact Us
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRODUCT SIDE MENU */}
        <AnimatePresence>
          {sidemenu && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 w-full h-screen bg-black/70 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center text-2xl gap-6"
            >
              <button
                onClick={() => setsidemenu(false)}
                className="absolute top-5 left-5 bg-black text-amber-400 px-6 py-2 rounded uppercase"
              >
                Back
              </button>
              {productLinks.map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  onClick={() => setsidemenu(false)}
                  className="hover:scale-105 transition-transform"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP NAVBAR */}
      <div className="hidden lg:flex items-center justify-between px-10 py-3">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-x-4 cursor-pointer"
        >
          <div className="w-14 h-14 overflow-hidden rounded-full border-2 border-amber-400">
            <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold uppercase">KT Computech</h1>
        </div>

        {/* Links */}
        <div className="flex items-center gap-x-8 text-lg font-semibold">
          {navLinks.map((link, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }}>
              <Link to={link.to} className="cursor-pointer hover:text-white transition-colors">
                {link.name}
              </Link>
            </motion.div>
          ))}

          {/* Product Dropdown with Delay */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className="hover:text-white">Products</span>
            <AnimatePresence>
              {productHover && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute flex flex-col top-[120%] left-0 bg-emerald-800/85 backdrop-blur-xs text-amber-400 rounded-md overflow-hidden shadow-lg z-[200]"
                >
                  {productLinks.map((item, i) => (
                    <Link
                      key={i}
                      to={item.link}
                      className="px-6 py-2 hover:bg-black/40 whitespace-nowrap"
                    >
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-x-6">
          <FaRegUserCircle
            onClick={() => navigate("/user")}
            className="text-2xl cursor-pointer hover:text-white"
          />
          <div className="relative group">
            {cart.length > 0 && (
              <small className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </small>
            )}
            <HiMiniShoppingCart
              onClick={() => navigate("/user/cart")}
              className="text-2xl cursor-pointer hover:text-white"
            />

            {/* Hover Dropdown for Cart */}
            <AnimatePresence>
              {cart.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 hidden group-hover:flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg w-80 mt-2 z-[300]"
                >
                  <div className="max-h-64 overflow-y-auto p-2">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border-b text-black"
                      >
                        <img
                          src={item.productPic}
                          alt={item.name}
                          className="w-14 h-14 rounded object-cover"
                        />
                        <div
                          onClick={() => navigate(`/product-dets/${item._id}`)}
                          className="flex flex-col flex-1 ml-2 cursor-pointer"
                        >
                          <p className="text-sm font-medium">
                            {item.name.slice(0, 15)}...
                          </p>
                          <small>
                            ₹{calculateDiscountedPrice(item.price, item.off)}
                          </small>
                        </div>
                        <button
                          onClick={() => cancelItem(item._id)}
                          className="bg-black text-amber-400 rounded p-2"
                        >
                          <IoTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/user/cart")}
                    className="w-full py-2 bg-black text-amber-400 font-semibold"
                  >
                    View Cart
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 hidden group-hover:flex bg-white border border-gray-300 text-black rounded-lg shadow-lg px-4 py-2 mt-2"
                >
                  <p>No items in cart</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Navbar);