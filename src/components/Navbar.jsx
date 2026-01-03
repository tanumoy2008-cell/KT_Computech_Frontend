import React, { memo, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMiniShoppingCart } from "react-icons/hi2";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "../config/axios";
import calculateDiscountedPrice from "../utils/PercentageCalculate";
import { setCart } from "../Store/reducers/CartReducer";
import { authData } from "../Store/reducers/UserReducer";

const Navbar = () => {
  const productTimeout = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { shopData } = useSelector((state) => state.ShopReducer);
  
  // Get user and cart state from Redux
  const user = useSelector((state) => state.UserReducer);
  const { items: cartItems = [], totalQuantity } = useSelector((state) => state.CartReducer);
  const isAuthenticated = user;

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  
  // Refs
  const lastScrollY = useRef(0);
  const cartRef = useRef(null);
  const cartTimeout = useRef(null);

  // Calculate cart count from totalQuantity in CartReducer
  const cartCount = totalQuantity || 0;

  // Toggle cart dropdown
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isProductOpen) setIsProductOpen(false);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  // Handle navigation for authentication buttons
  const handleAuthNavigation = (type) => {
    setIsCartOpen(false);
    navigate(`/user/${type}`);
  };
  

  // Handle click outside cart dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (cartTimeout.current) clearTimeout(cartTimeout.current);
    };
  }, []);

  useEffect(() => {
   const authenticateUser = async () => {
        if (!user) {
          const res = await axios.get("/api/user/profile");
          dispatch(authData(res.data.metaData));
        }
    };
    authenticateUser();
  }, [])
  

  // Fetch cart when component mounts and when authentication state changes
  useEffect(() => {
  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const cartRes = await axios.get("/api/cart/send-cart-info", {
          withCredentials: true // This ensures cookies are sent with the request
        });
        
        if (cartRes.data.success && Array.isArray(cartRes.data.cart)) {
          dispatch(setCart({ items: cartRes.data.cart }));
        } else {
          dispatch(setCart({ items: [] }));
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        if (err.response?.status === 401) {
          // Handle unauthorized (token expired, etc.)
          dispatch(authData(null)); // Clear user data
        }
        dispatch(setCart({ items: [] }));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Clear cart if user is not authenticated
      dispatch(setCart({ items: [] }));
    }
  };

  // Add a small delay to ensure user data is loaded
  const timer = setTimeout(() => {
    fetchCart();
  }, 100);

  return () => clearTimeout(timer);
}, [isAuthenticated, dispatch]);

  /* ----------------------------------------------
      SCROLL EFFECT
  ------------------------------------------------*/
  useEffect(() => {
  const handleScroll = () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScrollY.current && currentScroll > 50) {
      // user scrolling down
      setIsScrollingDown(true);
    } else {
      // user scrolling up
      setIsScrollingDown(false);
    }

    lastScrollY.current = currentScroll;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  /* ----------------------------------------------
      CLOSE MENUS WHEN ROUTE CHANGES
  ------------------------------------------------*/
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProductOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  /* ----------------------------------------------
      PRODUCT DROPDOWN HOVER
  ------------------------------------------------*/
  const handleProductEnter = () => {
    clearTimeout(productTimeout.current);
    setIsProductOpen(true);
  };

  const handleProductLeave = () => {
    productTimeout.current = setTimeout(() => setIsProductOpen(false), 200);
  };

  /* ----------------------------------------------
      CART DROPDOWN HOVER (300ms close delay)
  ------------------------------------------------*/
  const handleCartEnter = () => {
    clearTimeout(cartTimeout.current);
    setIsCartOpen(true);
  };

  const handleCartLeave = () => {
    cartTimeout.current = setTimeout(() => setIsCartOpen(false), 300);
  };


  /* ----------------------------------------------
      NAV LINKS
  ------------------------------------------------*/
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
    { name: "Household Products", link: "/product/house" },
    { name: "All Products", link: "/product/all" },
  ];

  return (
    <div
      className={`fixed w-full z-[999] py-1 bg-emerald-800 text-white shadow-lg transition-all duration-300 ${
        isScrollingDown ? "-top-[40%]" : "top-0"
      }`}
    >
      {/* ---------------- MOBILE HEADER ---------------- */}
      <div className="flex items-center justify-between px-4 py-2 lg:hidden">
        {/* Logo */}
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src={shopData?.logo || "./Logo.webp"} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold uppercase">{shopData?.name || 'KT Computech'}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <div
            className="relative"
            onMouseEnter={handleCartEnter}
            onMouseLeave={handleCartLeave}
          >
            {totalQuantity > 0 && (
              <small className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {totalQuantity > 9 ? "9+" : totalQuantity}
              </small>
            )}

            <HiMiniShoppingCart
              className="text-3xl cursor-pointer hover:text-amber-300"
              onClick={() => navigate("/user/cart")}
            />
          </div>

          {/* Mobile Menu Toggle */}
          {isMenuOpen ? (
            <IoMdClose className="text-3xl" onClick={() => setIsMenuOpen(false)} />
          ) : (
            <IoMdMenu className="text-3xl" onClick={() => setIsMenuOpen(true)} />
          )}
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-screen w-full bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center gap-6 text-2xl"
            >
              <Link to="/user" onClick={() => setIsMenuOpen(false)}>Profile</Link>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>

              {/* Mobile Product Expand */}
              <button
                className="flex items-center gap-2"
                onClick={() => setIsProductOpen(!isProductOpen)}
              >
                Products
                <motion.span animate={{ rotate: isProductOpen ? 180 : 0 }}>▼</motion.span>
              </button>

              <AnimatePresence>
                {isProductOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden text-xl"
                  >
                    {productLinks.map((item) => (
                      <Link
                        key={item.link}
                        to={item.link}
                        className="block py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- CART DROPDOWN (GLOBAL, MOBILE + DESKTOP) ---------------- */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed right-16 top-12 w-72 bg-white rounded-xl overflow-hidden shadow-xl z-[9999]"
            onMouseEnter={handleCartEnter}
            onMouseLeave={handleCartLeave}
          >
            <div className="p-4 bg-emerald-900 text-white font-semibold">
              Your Cart ({cartCount})
            </div>

            <div className="max-h-80 overflow-auto">
              {cartItems?.length > 0 ? (
                cartItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product-dets/${item._id}`}
                    className="flex items-center gap-3 p-3 border-b border-emerald-900"
                  >
                    <img
                      src={item.image}
                      className="w-16 h-16 object-cover rounded border border-emerald-700"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm text-emerald-700 font-PublicSans font-semibold">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-emerald-700 font-semibold">
                        ₹{calculateDiscountedPrice(item.price, item.off).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="p-6 text-center text-gray-500">Cart is empty</p>
              )}
            </div>

            
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- DESKTOP HEADER ---------------- */}
      <div className="hidden lg:flex items-center justify-between px-10 py-2 w-full mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img src={shopData?.logo || "./Logo.webp"} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold uppercase">KT Computech</h1>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-medium ${
                location.pathname === l.to
                  ? "text-white"
                  : "text-white hover:text-amber-300"
              }`}
            >
              {l.name}
            </Link>
          ))}

          {/* Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleProductEnter}
            onMouseLeave={handleProductLeave}
          >
            <button className="flex items-center gap-1 font-medium text-white hover:text-amber-300">
              Products
              <motion.span animate={{ rotate: isProductOpen ? 180 : 0 }}>
                ▼
              </motion.span>
            </button>

            {/* Product Dropdown */}
            <AnimatePresence>
              {isProductOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 w-56 bg-emerald-900 text-white rounded-lg shadow-xl overflow-hidden"
                >
                  {productLinks.map((item) => (
                    <Link
                      key={item.link}
                      to={item.link}
                      className="block px-4 py-3 hover:bg-emerald-700"
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
        <div className="flex items-center gap-6">
          {/* Simple Login Button */}
          <button 
            onClick={()=> navigate('/user')}
            className="flex items-center gap-1 text-white hover:text-amber-300"
          >
            <FaRegUserCircle className="text-2xl" />
          </button>

          {/* Cart Icon */}
          <div className="relative" ref={cartRef}>
            <button 
              onClick={toggleCart}
              className="relative"
              onMouseEnter={handleCartEnter}
              onMouseLeave={handleCartLeave}
            >
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
              <HiMiniShoppingCart className="text-2xl hover:text-amber-300" />
            </button>
            
            {/* Cart Dropdown */}
            <AnimatePresence>
              {isCartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="fixed right-16 top-12 w-72 bg-white rounded-xl overflow-hidden shadow-xl z-[9999]"
                  onMouseEnter={handleCartEnter}
                  onMouseLeave={handleCartLeave}
                >
                  <div className="p-4 bg-emerald-900 text-white font-semibold">
                    Your Cart ({cartCount || 0})
                  </div>

                  {!isAuthenticated ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-600 mb-4">Please sign in to view your cart</p>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAuthNavigation('login')}
                          className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => handleAuthNavigation('register')}
                          className="px-4 py-2 border border-emerald-700 text-emerald-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="p-6 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
                    </div>
                  ) : cartItems?.length > 0 ? (
                    <>
                      <div className="max-h-80 overflow-auto">
                        {cartItems.map((item) => (
                          <Link
                            key={`${item._id}-${item.color || ''}`}
                            to={`/product-dets/${item._id}`}
                            className="flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50"
                            onClick={() => setIsCartOpen(false)}
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={item.image || '/placeholder-product.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                              <p className="text-sm font-medium text-emerald-700">
                                ₹{(calculateDiscountedPrice(item.price, item.off || 0) * Number(item.quantity)).toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="p-4 bg-gray-50">
              <button
                className="w-full py-2 bg-emerald-700 text-white rounded mb-2 hover:bg-emerald-800 transition-colors"
                onClick={() => {
                  navigate("/user/cart");
                  setIsCartOpen(false);
                }}
              >
                View Cart
              </button>
              <button
                className="w-full py-2 bg-amber-600 text-white rounded hover:bg-amber-800 transition-colors"
                onClick={() => {
                  navigate("/product/all");
                  setIsCartOpen(false);
                }}
              >
                Buy More
              </button>
            </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 text-gray-300">
                        <HiMiniShoppingCart className="w-full h-full" />
                      </div>
                      <p className="text-gray-600 mb-4">Your cart is empty</p>
                      <button
                        onClick={() => {
                          navigate("/product/all");
                          setIsCartOpen(false);
                        }}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  )}
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
