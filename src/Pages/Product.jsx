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
  const limit = 12;
  const [showMenu, setShowMenu] = useState(false);

  const categories = [
    { key: "", label: "All Products" },
    { key: "pencil", label: "Pencils" },
    { key: "eraser", label: "Erasers" },
    { key: "sharpeners", label: "Sharpners" },
    { key: "notebook", label: "NoteBooks" },
    { key: "color", label: "Colors" },
    { key: "pen", label: "Pens" },
    { key: "exam", label: "Exams Items" },
    { key: "box", label: "Geometry Boxes" },
    { key: "pencilbox", label: "Bag & Pencil Boxes" },
  ];

  const fetchData = async (reset = false) => {
    try {
      const res = await axios.get(
        `/api/product/productSend?start=${
          reset ? 0 : start
        }&limit=${limit}&query=${query}&Maincategory=${Maincategory}&Subcategory=${Subcategory}`
      );
      setProduct((prev) =>
        reset ? res.data.product : [...prev, ...res.data.product]
      );
      setStart(res.data.nextStart);
      setHasMore(res.data.hasMore);
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
    <div className="w-full h-screen pt-40 xl:pt-52">
      <Navbar />
      <div className="flex flex-col fixed z-20 top-16 w-full gap-y-6 px-2 pt-4 lg:px-4 lg:pt-8 pb-4 items-center font-ArvoBold text-white bg-[#003426]">
        <div className="flex gap-x-4 items-center w-full justify-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="search product here. . ."
            className="w-11/12 text-lg placeholder:text-zinc-700 py-2 rounded outline-none text-black px-4 bg-white"
          />
          <button
            className="flex lg:hidden gap-x-2 items-center border px-4 py-2 rounded"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            Filters <IoMdArrowDropdown />
          </button>
        </div>
        <div className="w-full hidden lg:flex justify-around items-center text-xs xl:text-sm">
          {categories.map((cat) => (
            <h1
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`cursor-pointer px-4 ${
                Subcategory === cat.key && "border-b-2"
              }`}
            >
              {cat.label}
            </h1>
          ))}
        </div>
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex lg:hidden flex-col gap-y-4 text-center py-2 px-4 w-full top-[99%] bg-[#006A4E] text-lg"
            >
              {categories.map((cat) => (
                <h1
                  key={cat.key}
                  onClick={() => {
                    setCategory(cat.key);
                    setShowMenu(false);
                  }}
                  className={`cursor-pointer px-4 ${
                    Subcategory === cat.key && "border-b-2"
                  }`}
                >
                  {cat.label}
                </h1>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product List */}
      <div id="scrollDiv" className="w-full h-[82vh] overflow-y-auto">
        <InfiniteScroll
          dataLength={product.length}
          next={fetchData}
          hasMore={hasMore}
          scrollableTarget="scrollDiv"
          loader={Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-full animate-pulse bg-white border border-zinc-500 p-4 rounded flex flex-col gap-y-4 justify-between group"
            >
              <div className="w-full h-60 border border-zinc-500 overflow-hidden bg-zinc-400"></div>
              <h1 className="text-center text-2xl font-Jura font-bold bg-zinc-400 py-4 animate-pulse"></h1>
              <button className="py-4 text-zinc-400 bg-zinc-400 font-Jura text-xl animate-pulse text-center cursor-pointer">
                ₹ 00/-
              </button>
            </div>
          ))}
          endMessage={
            <div className="w-full h-full border flex items-center justify-center border-black overflow-hidden">
              <p className="text-center text-gray-800 font-mono text-xl">
                Sorry No more Product left!
              </p>
            </div>
          }
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 py-2 px-4 bg-[#320401]"
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
