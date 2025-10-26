import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "../config/axios";
import { useParams } from "react-router-dom";
import { IoMdArrowDropdown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const Product = () => {
  const { Maincategory } = useParams();
  const [product, setProduct] = useState([]);
  const [query, setQuery] = useState("");
  const [start, setStart] = useState(0);
  const [Subcategory, setCategory] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([
    { key: "", label: "All Products" },
  ]);

  const limit = 12;

  const fetchData = async (reset = false) => {
    try {
      const res = await axios.get(
        `/api/product/productSend?start=${reset ? 0 : start}&limit=${limit}&query=${query}&Maincategory=${Maincategory}&Subcategory=${Subcategory}`
      );

      // Set products
      setProduct((prev) =>
        reset ? res.data.product : [...prev, ...res.data.product]
      );
      setStart(res.data.nextStart);
      setHasMore(res.data.hasMore);
      if (res.data.subcategories) setCategories(res.data.subcategories);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [query, Subcategory, Maincategory]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(true);
      setStart(0);
      fetchData(true);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="w-full h-screen pt-36 xl:pt-48 bg-[#320401]">
      <Navbar />

      {/* Top Bar */}
      <div className="flex flex-col fixed z-30 top-16 w-full gap-y-4 px-3 pt-4 lg:px-6 lg:pt-6 pb-4 items-center font-PublicSans text-white bg-[#003426] shadow-lg">
        {/* Search & Filters */}
        <div className="flex gap-x-3 items-center w-full justify-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="🔍 Search products..."
            className="w-11/12 lg:w-full text-lg placeholder:text-gray-500 py-3 rounded-full outline-none text-black px-5 bg-white shadow focus:ring-2 focus:ring-green-600"
          />
          <button
            className="flex md:hidden gap-x-2 items-center border border-white/30 px-4 py-2 rounded-full text-sm bg-[#004d36] hover:bg-[#006A4E] transition"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            Filters <IoMdArrowDropdown />
          </button>
        </div>

        {/* Tablet Filter Bar */}
        <div className="hidden md:flex lg:hidden overflow-x-auto w-full gap-2 py-2 scrollbar-thin scrollbar-thumb-green-700">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                Subcategory === cat.key
                  ? "bg-white text-[#003426] font-bold shadow"
                  : "bg-[#004d36] hover:bg-[#006A4E]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden lg:flex w-full justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-green-700 gap-2">
        <div className="flex gap-4 px-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm transition-all duration-200 ${
                Subcategory === cat.key
                  ? "bg-white text-[#003426] font-bold shadow"
                  : "bg-[#004d36] hover:bg-[#006A4E]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex md:hidden flex-col gap-y-2 text-center py-3 px-4 w-full rounded-lg bg-[#004d36] shadow-md"
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setCategory(cat.key);
                    setShowMenu(false);
                  }}
                  className={`py-2 rounded transition ${
                    Subcategory === cat.key
                      ? "bg-white text-[#003426] font-bold"
                      : "hover:bg-[#006A4E]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        id="scrollDiv"
        className="w-full overflow-y-auto h-[calc(100vh-9.5rem)]"
      >
        <InfiniteScroll
          dataLength={product.length}
          next={fetchData}
          hasMore={hasMore}
          scrollableTarget="scrollDiv"
          loader={Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-full animate-pulse bg-white border border-zinc-300 p-4 rounded-xl flex flex-col gap-y-4 justify-between"
            >
              <div className="w-full h-48 border border-zinc-300 overflow-hidden bg-zinc-200 rounded-md"></div>
              <h1 className="text-center text-lg font-Jura font-bold bg-zinc-200 py-3 rounded"></h1>
              <button className="py-3 text-zinc-400 bg-zinc-200 font-Jura text-lg rounded text-center">
                ₹ 00/-
              </button>
            </div>
          ))}
          endMessage={
            <div className="w-full py-6 flex items-center justify-center">
              <p className="text-center text-gray-300 font-mono text-lg">
                🎉 You’ve reached the end! No more products.
              </p>
            </div>
          }
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 px-4 pb-4 md:pt-20 lg:pt-20 xl:pt-8 pt-8 bg-gradient-to-b from-[#1a1a1a] via-[#2d1a1a] to-[#320401]"
        >
          {product.map((p, i) => (
            <ProductCard data={p} key={i} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Product;