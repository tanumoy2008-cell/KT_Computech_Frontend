import React, { useEffect, useRef, useState } from "react";
import axios from "../config/axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  setProducts,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
} from "../Store/reducers/AdminProductReducer";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const {
    items,
    start,
    hasMore,
    query,
    maincategory,
    subcategory,
    scrollY,
    role,
  } = useSelector((state) => state.adminProductReducer);

  const [maincategories, setMaincategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 12;
  const scrollRef = useRef(null);

  const [lastMainCategory, setLastMainCategory] = useState(maincategory);
  const [lastSubCategory, setLastSubCategory] = useState(subcategory);

  // ======================= FETCH PRODUCTS =======================
  const fetchData = async (reset = false) => {
    // Only fetch if reset (filters changed) or has more data
    if (!reset && !hasMore) return;

    setIsLoading(true);
    try {
      const res = await axios.get("/api/product/productDetails", {
        params: {
          start: reset ? 0 : start,
          limit,
          query,
          Maincategory: maincategory,
          Subcategory: subcategory,
        },
      });

      dispatch(
        setProducts({
          products: res.data.product,
          reset,
        })
      );

      dispatch(
        setPagination({
          start: res.data.nextStart || 0,
          hasMore: res.data.hasMore,
        })
      );

      if (res.data.maincategories) setMaincategories(res.data.maincategories);
      if (res.data.subcategories) setSubcategories(res.data.subcategories);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      toast.error("Failed to fetch products!");
    } finally {
      setIsLoading(false);
    }
  };

  // ======================= FILTER / SEARCH =======================
  useEffect(() => {
    const filterChanged =
      maincategory !== lastMainCategory || subcategory !== lastSubCategory;

    fetchData(filterChanged);

    if (filterChanged) {
      dispatch(clearScrollY());
      setLastMainCategory(maincategory);
      setLastSubCategory(subcategory);
    }
  }, [query, maincategory, subcategory]);

  // ======================= RESTORE SCROLL =======================
  useEffect(() => {
    if (!scrollRef.current || scrollY === 0) return;

    const timer = setTimeout(() => {
      scrollRef.current.scrollTo({
        top: scrollY,
        behavior: "auto",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [items.length, scrollY]);

  // ======================= SAVE SCROLL =======================
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      dispatch(setScrollY(container.scrollTop));
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // ======================= DELETE HANDLER =======================
  const roleHandler = ({ id }) => {
    if (role === "admin") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You are not Super Admin",
        footer: "Contact Super Admin",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`/api/product/product-delete/${id}`);
          if (res.status === 200) {
            Swal.fire({
              title: "Deleted!",
              text: res.data.message,
              icon: "success",
            });
            dispatch(
              setProducts({
                products: items.filter((item) => item._id !== id),
                reset: true,
              })
            );
          } else toast.error(res.data.message);
        } catch {
          toast.error("Delete failed!");
        }
      }
    });
  };

  // ======================= SKELETON ROW =======================
  const SkeletonRow = () => (
    <div className="flex w-full items-center gap-x-2 border py-2 px-1 rounded animate-pulse bg-gray-100">
      <div className="w-[14%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[14%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[14%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[14%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[8%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[8%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[16%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[9%] h-4 bg-gray-300 rounded"></div>
      <div className="w-[9%] h-4 bg-gray-300 rounded"></div>
    </div>
  );

  // ======================= UI =======================
  return (
    <div className="h-screen w-full bg-zinc-800 px-4 sm:px-10 py-5 flex flex-col gap-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 bg-white px-4 py-4 rounded-lg items-center">
        <input
          value={query}
          onChange={(e) => dispatch(setFilters({ query: e.target.value }))}
          placeholder="Search by name, company, or barcode..."
          className="w-full sm:w-[40%] border px-4 py-2 outline-none rounded-md"
        />
        <select
          value={maincategory}
          onChange={(e) =>
            dispatch(
              setFilters({ maincategory: e.target.value, subcategory: "" })
            )
          }
          className="w-full sm:w-[30%] border px-4 py-2 outline-none rounded-md"
        >
          <option value="all">All Categories</option>
          {maincategories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={subcategory}
          onChange={(e) =>
            dispatch(setFilters({ subcategory: e.target.value }))
          }
          className="w-full sm:w-[30%] border px-4 py-2 outline-none rounded-md"
        >
          {subcategories.map((sub, i) => (
            <option key={i} value={sub.key}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="w-full h-[85vh] py-4 px-4 rounded-md bg-white flex flex-col">
        <div className="flex w-full bg-white font-bold gap-x-2 text-center mb-2 text-lg">
          <h1 className="w-[14%] border py-2 rounded bg-sky-200">Name</h1>
          <h1 className="w-[14%] border py-2 rounded bg-yellow-200">Company</h1>
          <h1 className="w-[14%] border py-2 rounded bg-orange-200">Main</h1>
          <h1 className="w-[14%] border py-2 rounded bg-orange-200">Sub</h1>
          <h1 className="w-[8%] border py-2 rounded bg-violet-200">Price</h1>
          <h1 className="w-[8%] border py-2 rounded bg-amber-200">Stock</h1>
          <h1 className="w-[16%] border py-2 rounded bg-slate-200">Barcodes</h1>
          <h1 className="w-[9%] border py-2 rounded px-2 bg-green-200">Edit</h1>
          <h1 className="w-[9%] border py-2 rounded px-2 bg-red-200">Delete</h1>
        </div>

        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="overflow-auto h-[calc(85vh-50px)]"
        >
          <InfiniteScroll
            dataLength={items.length}
            next={() => fetchData(false)}
            hasMore={hasMore}
            loader={Array.from({ length: limit }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
            scrollableTarget="scrollableDiv"
            endMessage={
              <p className="text-center text-gray-400 py-4">
                🎉 You have reached the end of the list!
              </p>
            }
            className="flex flex-col gap-y-2"
          >
            {items.map((p) => (
              <div
                key={p._id}
                className="flex w-full items-center gap-x-2 border py-2 px-1 rounded hover:bg-gray-50 transition-all"
              >
                <h1 className="w-[14%] text-center">{p.name}</h1>
                <h1 className="w-[14%] text-center">{p.company}</h1>
                <h1 className="w-[14%] text-center">{p.Maincategory}</h1>
                <h1 className="w-[14%] text-center">{p.Subcategory}</h1>
                <h1 className="w-[8%] text-center">{p.price}</h1>
                <h1 className="w-[8%] text-center">{p.stock}</h1>
                <div className="w-[16%] text-center flex flex-col items-center overflow-x-auto">
                  {p.codes?.length
                    ? p.codes.map((code, idx) => (
                        <span
                          key={idx}
                          className="block text-xs bg-gray-100 border rounded-md py-1 px-2 my-1 w-fit"
                        >
                          {code}
                        </span>
                      ))
                    : "—"}
                </div>
                <Link
                  to={`/product-edit/${p._id}`}
                  className="w-[9%] bg-sky-400 px-2 py-2 text-center text-white rounded-md hover:bg-sky-600"
                >
                  Edit
                </Link>
                <h1
                  onClick={() => roleHandler({ id: p._id })}
                  className="w-[9%] bg-red-400 px-2 py-2 text-center text-white rounded-md hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </h1>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
