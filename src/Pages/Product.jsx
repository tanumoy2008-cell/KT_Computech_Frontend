import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdArrowDropdown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  setProducts,
  setCategories,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
  resetQuery,
} from "../Store/reducers/ProductReducer";

const Product = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Maincategory } = useParams();

  const { items, categories, start, hasMore, Subcategory, query, scrollY } =
    useSelector((state) => state.ProductReducer);

  const [filteredItems, setFilteredItems] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const limit = 12;
  const searchTimerRef = useRef(null);
  // layoutMode: 'comfortable' | 'compact'
  const [layoutMode, setLayoutMode] = useState('comfortable');
  const scrollDivRef = useRef(null);
  const subcatScrollRef = useRef(null);
  const [lastMainCategory, setLastMainCategory] = useState(Maincategory);
  const [lastSubCategory, setLastSubCategory] = useState(Subcategory);

  // ======================= FETCH PRODUCTS =======================
  const fetchData = async (reset = false) => {
    if (isFetching) return; // prevent loop
    if (!reset && !hasMore) return;

    setIsFetching(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `/api/product/productSend?start=${reset ? 0 : start}&limit=${limit}&query=${query}&Maincategory=${Maincategory}&Subcategory=${Subcategory}`
      );

      dispatch(
        setProducts({
          products: res.data.product,
          reset,
        })
      );
      dispatch(
        setPagination({
          start: res.data.nextStart,
          hasMore: res.data.hasMore,
        })
      );
      if (res.data.subcategories) {
        dispatch(setCategories(res.data.subcategories));
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // ======================= INITIAL LOAD =======================
  useEffect(() => {
    const categoryChanged =
      Maincategory !== lastMainCategory || Subcategory !== lastSubCategory;

    dispatch(setFilters({ Maincategory }));

    if (categoryChanged) {
      dispatch(clearScrollY());
      setLastMainCategory(Maincategory);
      setLastSubCategory(Subcategory);
      fetchData(true);
      return;
    }

    if (items.length === 0) fetchData(true);
    else if (firstLoad) setFirstLoad(false);
  }, [Maincategory, Subcategory]);

  // ======================= SMART SEARCH =======================
  useEffect(() => {
    // If query cleared, show main items and ensure list is loaded
    if (!query || query.trim() === "") {
      setFilteredItems(items);
      if (items.length === 0 && !isFetching) fetchData(true);
      return;
    }

    const q = query.toLowerCase();
    const localResults = items.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.Subcategory?.toLowerCase().includes(q)
    );

    // Show local results immediately for snappy UI
    setFilteredItems(localResults);

    // Debounce backend search and merge results with local ones
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        setIsFetching(true);
        const res = await axios.get(
          `/api/product/productSend`,
          {
            params: { start: 0, limit: 15, query: q, Maincategory, Subcategory },
          }
        );

        const backend = res.data.product || [];
        const map = new Map();
        // add local first (to keep order), then backend (if not present)
        localResults.forEach((p) => map.set(p._id, p));
        backend.forEach((p) => {
          if (!map.has(p._id)) map.set(p._id, p);
        });

        setFilteredItems(Array.from(map.values()));
      } catch (err) {
        console.error("Search backend failed:", err);
      } finally {
        setIsFetching(false);
      }
    }, 350);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query, items, Maincategory, Subcategory]);

  // ======================= RESTORE SCROLL =======================
  useEffect(() => {
    const container = scrollDivRef.current;
    if (!container || scrollY <= 0) return;
    const timer = setTimeout(() => {
      container.scrollTo({ top: scrollY, behavior: "instant" });
    }, 150);
    return () => clearTimeout(timer);
  }, [items.length]);

  // ======================= SAVE SCROLL =======================
  useEffect(() => {
    const container = scrollDivRef.current;
    if (!container) return;
    const handleScroll = () => dispatch(setScrollY(container.scrollTop));
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // ======================= SCROLL BUTTONS =======================
  const scrollLeft = () => {
    if (subcatScrollRef.current)
      subcatScrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (subcatScrollRef.current)
      subcatScrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  // ======================= PRODUCT CLICK =======================
  const handleProductClick = (product) => {
    const container = scrollDivRef.current;
    if (container) dispatch(setScrollY(container.scrollTop));
    navigate(`/product-dets/${product._id}`);
  };

  // ======================= SKELETON CARD =======================
  const SkeletonCard = () => (
    <div className="bg-[#2a2a2a] animate-pulse rounded-2xl overflow-hidden flex flex-col gap-3 shadow-lg">
      <div className="w-full h-48 sm:h-56 md:h-60 bg-[#3a3a3a]" />
      <div className="h-4 bg-[#3a3a3a] rounded w-3/4 mx-3" />
      <div className="h-3 bg-[#3a3a3a] rounded w-1/2 mx-3 mb-3" />
    </div>
  );

  const displayItems = query ? filteredItems : items;

  // ======================= UI =======================
  return (
    <div className="w-full h-screen flex flex-col bg-green-200 text-white">
      <Navbar />

      {/* ===== TOP BAR ===== */}
      <div className="fixed z-30 top-[4rem] md:top-[4.5rem] w-full bg-gradient-to-r from-[#013220] to-[#005a3c] px-4 py-8 md:py-4 shadow-lg">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <input
            value={query}
            onChange={(e) => dispatch(setFilters({ query: e.target.value }))}
            type="text"
            placeholder="Search for products..."
            className="flex-grow text-base md:text-lg placeholder:text-gray-400 py-3 rounded-full outline-none text-black px-5 bg-white shadow focus:ring-2 focus:ring-green-600 transition-all"
          />
          <button
            className="flex md:hidden items-center gap-2 px-4 py-2 rounded-full bg-[#004d36] text-white border border-white/20 hover:bg-[#006A4E] transition"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            Filters <IoMdArrowDropdown />
          </button>
          {/* Layout toggle (desktop) */}
          <div className="hidden md:flex items-center gap-2 ml-3">
            <button
              onClick={() => setLayoutMode('comfortable')}
              className={`px-3 py-2 rounded-md text-sm ${layoutMode === 'comfortable' ? 'bg-white text-[#013220] font-bold' : 'text-white bg-transparent hover:bg-white/10'}`}
            >
              Comfortable
            </button>
            <button
              onClick={() => setLayoutMode('compact')}
              className={`px-3 py-2 rounded-md text-sm ${layoutMode === 'compact' ? 'bg-white text-[#013220] font-bold' : 'text-white bg-transparent hover:bg-white/10'}`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* ===== Subcategory Buttons (Desktop) ===== */}
        <div className="relative hidden md:flex items-center w-full max-w-6xl mx-auto py-1">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 z-10 bg-[#017f59] hover:bg-[#006A4E] text-white rounded-full p-2 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Scrollable categories */}
          <div
            ref={subcatScrollRef}
            className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-green-700 gap-2 px-10 mt-2 scroll-smooth"
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  dispatch(setFilters({ Subcategory: cat.key }))
                  dispatch(resetQuery())
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  Subcategory === cat.key
                    ? "bg-white text-[#013220] font-bold shadow"
                    : "bg-[#004d36] hover:bg-[#006A4E] text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 z-10 bg-[#017f59] hover:bg-[#006A4E] text-white rounded-full p-2 shadow-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ===== Subcategory Dropdown (Mobile) ===== */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex md:hidden flex-col gap-y-2 text-center py-3 px-4 
                        overflow-y-auto max-h-[70vh] rounded-lg 
                        bg-[#004d36] shadow-md mt-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900"
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    dispatch(setFilters({ Subcategory: cat.key }));
                    setShowMenu(false);
                  }}
                  className={`py-2 rounded transition ${
                    Subcategory === cat.key
                      ? "bg-white text-[#003426] font-bold"
                      : "hover:bg-[#006A4E] text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== PRODUCT GRID ===== */}
      <div
        id="scrollDiv"
        ref={scrollDivRef}
        className="flex-grow overflow-y-auto mt-[11rem] md:mt-[13rem] pb-5"
      >
        <InfiniteScroll
          dataLength={displayItems.length}
          next={() => fetchData(false)}
          hasMore={hasMore}
          scrollableTarget="scrollDiv"
          loader={Array.from({ length: limit }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
          endMessage={
            <div className="w-full py-10 text-center text-gray-400 font-semibold">
              🎉 You’ve reached the end!
            </div>
          }
          className={
            layoutMode === 'compact'
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-2 md:px-4 pb-5 pt-4 bg-green-200"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-6 px-5 md:px-8 pb-5 pt-4 bg-green-200"
          }
        >
          {displayItems.length > 0
            ? displayItems.map((p, i) => (
                <motion.div
                  key={p._id || i}
                  onClick={() => handleProductClick(p)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                >
                  <ProductCard data={p} variant={layoutMode} />
                </motion.div>
              ))
            : !isLoading && (
                <p className="text-center text-gray-400 col-span-full py-10">
                  No products found.
                </p>
              )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Product;